import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardActions,
    Button,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Container,
    IconButton,
    Paper,
    InputAdornment,
    Divider
} from '@mui/material';
import {
    Visibility,
    Edit,
    Delete,
    Search,
    Add,
    AddShoppingCart,
    ShoppingCart,
    Remove
} from '@mui/icons-material';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Cart state
    const [cart, setCart] = useState({ id: 0, session_id: '', cart_items: [] });
    const [cartLoading, setCartLoading] = useState(false);

    const API_BASE_URL = 'http://localhost:8001'; // Updated to port 8001
    
    // Generate or get session ID
    const getSessionId = () => {
        let sessionId = localStorage.getItem('cart_session_id');
        if (!sessionId) {
            sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('cart_session_id', sessionId);
        }
        return sessionId;
    };

    // Fetch products from API
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/products/`);
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const data = await response.json();
            setProducts(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch cart from API
    const fetchCart = async () => {
        try {
            const sessionId = getSessionId();
            const response = await fetch(`${API_BASE_URL}/cart/${sessionId}`);
            if (response.ok) {
                const cartData = await response.json();
                setCart(cartData);
            }
        } catch (err) {
            console.error('Error fetching cart:', err);
        }
    };

    // Add item to cart
    const addToCart = async (product) => {
        if (product.stock <= 0) {
            setError('Product is out of stock');
            return;
        }

        try {
            setCartLoading(true);
            const sessionId = getSessionId();
            
            const response = await fetch(`${API_BASE_URL}/cart/add?session_id=${sessionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_id: product.id,
                    quantity: 1
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to add item to cart');
            }

            // Re-fetch cart and products to update stock
            await Promise.all([fetchCart(), fetchProducts()]);
            
        } catch (err) {
            setError(err.message);
        } finally {
            setCartLoading(false);
        }
    };

    // Remove item from cart
    const removeFromCart = async (itemId) => {
        try {
            setCartLoading(true);
            const sessionId = getSessionId();
            
            const response = await fetch(`${API_BASE_URL}/cart/${sessionId}/item/${itemId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to remove item from cart');
            }

            // Re-fetch cart and products
            await Promise.all([fetchCart(), fetchProducts()]);
            
        } catch (err) {
            setError(err.message);
        } finally {
            setCartLoading(false);
        }
    };

    // Get cart total
    const getCartTotal = () => {
        return cart.cart_items.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0).toFixed(2);
    };

    // Get cart item count
    const getCartItemCount = () => {
        return cart.cart_items.reduce((total, item) => total + item.quantity, 0);
    };

    // Load products and cart on component mount
    useEffect(() => {
        fetchProducts();
        fetchCart();
    }, []);

    const [searchTerm, setSearchTerm] = useState('');
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        stock: ''
    });

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleView = (product) => {
        setSelectedProduct(product);
        setViewDialogOpen(true);
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name,
            price: product.price.toString(),
            description: product.description,
            stock: product.stock.toString()
        });
        setEditDialogOpen(true);
    };

    const handleDelete = (product) => {
        setSelectedProduct(product);
        setDeleteDialogOpen(true);
    };

    const handleAddProduct = () => {
        setFormData({
            name: '',
            price: '',
            description: '',
            stock: ''
        });
        setAddDialogOpen(true);
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddSubmit = async () => {
        try {
            const newProduct = {
                name: formData.name,
                price: parseFloat(formData.price),
                description: formData.description,
                stock: parseInt(formData.stock)
            };
            
            const response = await fetch(`${API_BASE_URL}/products/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newProduct)
            });
            
            if (!response.ok) {
                throw new Error('Failed to create product');
            }
            
            await fetchProducts(); // Refresh the product list
            setAddDialogOpen(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEditSubmit = async () => {
        try {
            const updatedProduct = {
                name: formData.name,
                price: parseFloat(formData.price),
                description: formData.description,
                stock: parseInt(formData.stock)
            };
            
            const response = await fetch(`${API_BASE_URL}/products/${selectedProduct.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedProduct)
            });
            
            if (!response.ok) {
                throw new Error('Failed to update product');
            }
            
            await fetchProducts(); // Refresh the product list
            setEditDialogOpen(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${selectedProduct.id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete product');
            }
            
            await fetchProducts(); // Refresh the product list
            setDeleteDialogOpen(false);
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <Typography variant="h6">Loading products...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <Typography variant="h6" color="error">Error: {error}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            {/* Header */}
            <Paper elevation={0} sx={{ borderRadius: 0, py: 3, mb: 3 }}>
                <Container maxWidth="xl">
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                            Product Management
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2}>
                            <TextField
                                placeholder="Search products..."
                                variant="outlined"
                                size="small"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    width: 300,
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'white'
                                    }
                                }}
                            />
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={handleAddProduct}
                                sx={{
                                    backgroundColor: '#1976d2',
                                    px: 3,
                                    py: 1
                                }}
                            >
                                Add Product
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Paper>

            {/* Product Grid */}
            <Container maxWidth="xl">
                <Grid container spacing={3}>
                    {filteredProducts.map((product) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRadius: 2,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    '&:hover': {
                                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                                        transform: 'translateY(-2px)'
                                    },
                                    transition: 'all 0.2s ease-in-out'
                                }}
                            >
                                {/* Product Image Placeholder */}
                                <Box
                                    sx={{
                                        height: 140,
                                        backgroundColor: '#e0e0e0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '8px 8px 0 0'
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        Product Image
                                    </Typography>
                                </Box>

                                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                    <Typography
                                        variant="h6"
                                        component="h3"
                                        gutterBottom
                                        sx={{
                                            fontWeight: 600,
                                            fontSize: '1.1rem',
                                            lineHeight: 1.2
                                        }}
                                    >
                                        {product.name}
                                    </Typography>
                                    <Typography
                                        variant="h5"
                                        color="primary"
                                        sx={{
                                            fontWeight: 700,
                                            mb: 1
                                        }}
                                    >
                                        ${product.price}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            lineHeight: 1.4
                                        }}
                                    >
                                        {product.description}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            mt: 1,
                                            color: product.stock > 10 ? 'success.main' : product.stock > 0 ? 'warning.main' : 'error.main'
                                        }}
                                    >
                                        Stock: {product.stock}
                                    </Typography>
                                </CardContent>

                                <Divider />

                                <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
                                    <Box display="flex" gap={1}>
                                        <Button
                                            size="small"
                                            startIcon={<Visibility />}
                                            onClick={() => handleView(product)}
                                            sx={{ color: 'text.secondary' }}
                                        >
                                            View
                                        </Button>
                                        <Button
                                            size="small"
                                            startIcon={<Edit />}
                                            onClick={() => handleEdit(product)}
                                            sx={{ color: 'primary.main' }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="small"
                                            startIcon={<Delete />}
                                            onClick={() => handleDelete(product)}
                                            sx={{ color: 'error.main' }}
                                        >
                                            Delete
                                        </Button>
                                    </Box>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<AddShoppingCart />}
                                        onClick={() => addToCart(product)}
                                        disabled={product.stock <= 0 || cartLoading}
                                        sx={{
                                            backgroundColor: '#4caf50',
                                            '&:hover': {
                                                backgroundColor: '#45a049'
                                            },
                                            '&:disabled': {
                                                backgroundColor: '#ccc'
                                            }
                                        }}
                                    >
                                        {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* View Product Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Product Details
                    <IconButton
                        aria-label="close"
                        onClick={() => setViewDialogOpen(false)}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                        }}
                    >
                        ×
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {selectedProduct && (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                {selectedProduct.name}
                            </Typography>
                            <Typography variant="body1" paragraph>
                                {selectedProduct.description}
                            </Typography>
                            <Box display="flex" justifyContent="space-between" mt={2}>
                                <Typography variant="body1">
                                    <strong>Price:</strong> ${selectedProduct.price}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Stock:</strong> {selectedProduct.stock} units
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {/* Add Product Dialog */}
            <Dialog
                open={addDialogOpen}
                onClose={() => setAddDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Add New Product
                    <IconButton
                        aria-label="close"
                        onClick={() => setAddDialogOpen(false)}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                        }}
                    >
                        ×
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Product Name"
                            value={formData.name}
                            onChange={(e) => handleFormChange('name', e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Description"
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => handleFormChange('description', e.target.value)}
                        />
                        <Box display="flex" gap={2}>
                            <TextField
                                margin="normal"
                                required
                                label="Price ($)"
                                type="number"
                                value={formData.price}
                                onChange={(e) => handleFormChange('price', e.target.value)}
                                sx={{ flex: 1 }}
                            />
                            <TextField
                                margin="normal"
                                required
                                label="Stock"
                                type="number"
                                value={formData.stock}
                                onChange={(e) => handleFormChange('stock', e.target.value)}
                                sx={{ flex: 1 }}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setAddDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddSubmit}
                        variant="contained"
                        disabled={!formData.name || !formData.price || !formData.stock}
                    >
                        Add Product
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Product Dialog */}
            <Dialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Edit Product
                    <IconButton
                        aria-label="close"
                        onClick={() => setEditDialogOpen(false)}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                        }}
                    >
                        ×
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Product Name"
                            value={formData.name}
                            onChange={(e) => handleFormChange('name', e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Description"
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => handleFormChange('description', e.target.value)}
                        />
                        <Box display="flex" gap={2}>
                            <TextField
                                margin="normal"
                                required
                                label="Price ($)"
                                type="number"
                                value={formData.price}
                                onChange={(e) => handleFormChange('price', e.target.value)}
                                sx={{ flex: 1 }}
                            />
                            <TextField
                                margin="normal"
                                required
                                label="Stock"
                                type="number"
                                value={formData.stock}
                                onChange={(e) => handleFormChange('stock', e.target.value)}
                                sx={{ flex: 1 }}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setEditDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleEditSubmit}
                        variant="contained"
                        disabled={!formData.name || !formData.price || !formData.stock}
                    >
                        Update Product
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Product Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Delete Product</DialogTitle>
                <DialogContent>
                    {selectedProduct && (
                        <Typography>
                            Are you sure you want to delete "{selectedProduct.name}"? This action cannot be undone.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                    >
                        Delete Product
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* Cart Widget - Bottom Left */}
            {getCartItemCount() > 0 && (
                <Paper
                    elevation={8}
                    sx={{
                        position: 'fixed',
                        bottom: 20,
                        left: 20,
                        width: 300,
                        maxHeight: 400,
                        zIndex: 1000,
                        borderRadius: 2,
                        overflow: 'hidden'
                    }}
                >
                    <Box
                        sx={{
                            backgroundColor: '#1976d2',
                            color: 'white',
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >
                        <ShoppingCart />
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            Shopping Cart
                        </Typography>
                        <Typography variant="body2">
                            {getCartItemCount()} items
                        </Typography>
                    </Box>
                    
                    <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                        {cart.cart_items.map((item) => (
                            <Box
                                key={item.id}
                                sx={{
                                    p: 2,
                                    borderBottom: '1px solid #eee',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2
                                }}
                            >
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {item.product.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        ${item.product.price} × {item.quantity}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    ${(item.product.price * item.quantity).toFixed(2)}
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={() => removeFromCart(item.id)}
                                    disabled={cartLoading}
                                    sx={{ color: 'error.main' }}
                                >
                                    <Remove />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                    
                    <Box
                        sx={{
                            p: 2,
                            backgroundColor: '#f5f5f5',
                            borderTop: '1px solid #ddd'
                        }}
                    >
                        <Typography variant="h6" sx={{ textAlign: 'center' }}>
                            Total: ${getCartTotal()}
                        </Typography>
                    </Box>
                </Paper>
            )}
        </Box>
    );
};

export default ProductManagement;
