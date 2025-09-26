from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from config import settings
from database import User, Product, Cart, CartItem, create_tables, get_db


class UserCreate(BaseModel):
    name: str
    email: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True


class ProductDTO(BaseModel):
    id: int
    name: str
    price: float
    description: Optional[str] = None
    stock: int

    class Config:
        from_attributes = True


class ProductCreateDTO(BaseModel):
    name: str
    price: float
    description: Optional[str] = None
    stock: int


class ProductUpdateDTO(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    stock: Optional[int] = None


# --- Cart DTOs ---

class CartItemDTO(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: ProductDTO

    class Config:
        from_attributes = True


class CartDTO(BaseModel):
    id: int
    session_id: str
    cart_items: List[CartItemDTO] = []

    class Config:
        from_attributes = True


class AddToCartDTO(BaseModel):
    product_id: int
    quantity: int = 1


class UpdateCartItemDTO(BaseModel):
    quantity: int


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],  # React ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Welcome to FastAPI Template"}


@app.post("/users/", response_model=UserResponse)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.email == user.email))
    db_user = result.first()

    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_user = User(name=user.name, email=user.email)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


@app.get("/users/", response_model=List[UserResponse])
async def get_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    users = result.scalars().all()
    return users


# --- Product endpoints ---

@app.post("/products/", response_model=ProductDTO)
async def create_product(product: ProductCreateDTO, db: AsyncSession = Depends(get_db)):
    db_product = Product(**product.dict())
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product


@app.get("/products/", response_model=List[ProductDTO])
async def get_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product))
    products = result.scalars().all()
    return products


@app.get("/products/{product_id}", response_model=ProductDTO)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).filter(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@app.put("/products/{product_id}", response_model=ProductDTO)
async def update_product(
    product_id: int, product_update: ProductUpdateDTO, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Product).filter(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for key, value in product_update.dict(exclude_unset=True).items():
        setattr(product, key, value)

    await db.commit()
    await db.refresh(product)
    return product


@app.delete("/products/{product_id}")
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).filter(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    await db.delete(product)
    await db.commit()
    return {"detail": "Product deleted"}


# --- Cart endpoints ---

@app.post("/cart/add")
async def add_to_cart(
    session_id: str, 
    item: AddToCartDTO, 
    db: AsyncSession = Depends(get_db)
):
    # Check if product exists and has enough stock
    result = await db.execute(select(Product).filter(Product.id == item.product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product.stock < item.quantity:
        raise HTTPException(status_code=400, detail="Not enough stock available")
    
    # Get or create cart for session
    result = await db.execute(select(Cart).filter(Cart.session_id == session_id))
    cart = result.scalar_one_or_none()
    
    if not cart:
        cart = Cart(session_id=session_id)
        db.add(cart)
        await db.commit()
        await db.refresh(cart)
    
    # Check if item already exists in cart
    result = await db.execute(
        select(CartItem).filter(
            CartItem.cart_id == cart.id,
            CartItem.product_id == item.product_id
        )
    )
    existing_item = result.scalar_one_or_none()
    
    if existing_item:
        # Update quantity
        new_quantity = existing_item.quantity + item.quantity
        if product.stock < new_quantity:
            raise HTTPException(status_code=400, detail="Not enough stock available")
        existing_item.quantity = new_quantity
    else:
        # Create new cart item
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=item.product_id,
            quantity=item.quantity
        )
        db.add(cart_item)
    
    await db.commit()
    return {"message": "Item added to cart"}


@app.get("/cart/{session_id}", response_model=CartDTO)
async def get_cart(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Cart)
        .filter(Cart.session_id == session_id)
        .options(
            selectinload(Cart.cart_items)
            .selectinload(CartItem.product)
        )
    )
    cart = result.scalar_one_or_none()
    
    if not cart:
        # Return empty cart
        return CartDTO(id=0, session_id=session_id, cart_items=[])
    
    return cart


@app.put("/cart/{session_id}/item/{item_id}")
async def update_cart_item(
    session_id: str,
    item_id: int,
    update_data: UpdateCartItemDTO,
    db: AsyncSession = Depends(get_db)
):
    # Get cart item
    result = await db.execute(
        select(CartItem)
        .join(Cart)
        .filter(Cart.session_id == session_id, CartItem.id == item_id)
    )
    cart_item = result.scalar_one_or_none()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    # Check stock availability
    result = await db.execute(select(Product).filter(Product.id == cart_item.product_id))
    product = result.scalar_one_or_none()
    
    if product.stock < update_data.quantity:
        raise HTTPException(status_code=400, detail="Not enough stock available")
    
    cart_item.quantity = update_data.quantity
    await db.commit()
    
    return {"message": "Cart item updated"}


@app.delete("/cart/{session_id}/item/{item_id}")
async def remove_from_cart(
    session_id: str,
    item_id: int,
    db: AsyncSession = Depends(get_db)
):
    # Get cart item
    result = await db.execute(
        select(CartItem)
        .join(Cart)
        .filter(Cart.session_id == session_id, CartItem.id == item_id)
    )
    cart_item = result.scalar_one_or_none()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    await db.delete(cart_item)
    await db.commit()
    
    return {"message": "Item removed from cart"}


@app.delete("/cart/{session_id}")
async def clear_cart(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Cart).filter(Cart.session_id == session_id))
    cart = result.scalar_one_or_none()
    
    if cart:
        await db.delete(cart)
        await db.commit()
    
    return {"message": "Cart cleared"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
