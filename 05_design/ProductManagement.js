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
    Add
} from '@mui/icons-material';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = 'http://localhost:8000';

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

    // Load products on component mount
    useEffect(() => {
        fetchProducts();
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
        </Box>
    );
};

export default ProductManagement;
