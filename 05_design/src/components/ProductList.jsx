import React, { useState } from 'react';
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
    InputAdornment,
    Container,
    IconButton,
    Paper
} from '@mui/material';
import {
    Add,
    Search
} from '@mui/icons-material';

// Mock data for design demonstration
const mockProducts = [
    {
        id: 1,
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 299.99,
        stock: 25
    },
    {
        id: 2,
        name: 'Smartphone Case',
        description: 'Durable protective case for smartphones',
        price: 29.99,
        stock: 150
    },
    {
        id: 3,
        name: 'USB Cable',
        description: 'Fast charging USB-C cable, 2 meters long',
        price: 19.99,
        stock: 75
    },
    {
        id: 4,
        name: 'Bluetooth Speaker',
        description: 'Portable wireless speaker with excellent sound quality',
        price: 89.99,
        stock: 40
    },
    {
        id: 5,
        name: 'Laptop Stand',
        description: 'Adjustable aluminum laptop stand for ergonomic workspace',
        price: 59.99,
        stock: 30
    },
    {
        id: 6,
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with precision tracking',
        price: 49.99,
        stock: 60
    }
];

const ProductList = () => {
    const [products, setProducts] = useState(mockProducts);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        stock: ''
    });
    const [editingProductId, setEditingProductId] = useState(null);

    const handleDeleteClick = (product) => {
        setProductToDelete(product);
        setDeleteDialogOpen(true);
    };

    const handleViewClick = (product) => {
        setSelectedProduct(product);
        setViewDialogOpen(true);
    };

    const handleEditClick = (product) => {
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock
        });
        setEditingProductId(product.id);
        setEditDialogOpen(true);
    };

    const handleAddClick = () => {
        setFormData({
            name: '',
            price: '',
            description: '',
            stock: ''
        });
        setAddDialogOpen(true);
    };

    const handleFormSubmit = (isEdit = false) => {
        const newProduct = {
            id: isEdit ? editingProductId : Date.now(),
            name: formData.name,
            price: parseFloat(formData.price),
            description: formData.description,
            stock: parseInt(formData.stock)
        };

        if (isEdit) {
            setProducts(products.map(p =>
                p.id === editingProductId ? newProduct : p
            ));
            setEditDialogOpen(false);
        } else {
            setProducts([...products, newProduct]);
            setAddDialogOpen(false);
        }

        setFormData({ name: '', description: '', price: '', stock: '' });
        setEditingProductId(null);
    };

    const handleDeleteConfirm = () => {
        setProducts(products.filter(p => p.id !== productToDelete.id));
        setDeleteDialogOpen(false);
        setProductToDelete(null);
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            {/* Header */}
            <Paper elevation={0} sx={{ borderRadius: 0, py: 2.5, mb: 3, backgroundColor: 'white', borderBottom: '1px solid #e0e0e0' }}>
                <Container maxWidth="xl">
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h5" component="h1" sx={{ fontWeight: 500, color: 'text.primary', fontSize: '1.5rem' }}>
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
                                            <Search fontSize="small" color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    width: 280,
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '4px',
                                        height: '36px',
                                        '& fieldset': {
                                            borderColor: '#d1d5db'
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#9ca3af'
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#1976d2'
                                        }
                                    },
                                    '& .MuiInputBase-input': {
                                        fontSize: '0.875rem'
                                    }
                                }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleAddClick}
                                sx={{
                                    backgroundColor: '#1976d2',
                                    color: 'white',
                                    px: 2.5,
                                    py: 1,
                                    borderRadius: '4px',
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    fontSize: '0.875rem',
                                    height: '36px',
                                    boxShadow: 'none',
                                    '&:hover': {
                                        backgroundColor: '#1565c0',
                                        boxShadow: 'none'
                                    }
                                }}
                            >
                                + Add Product
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Paper>

            {filteredProducts.length === 0 ? (
                <Container maxWidth="xl">
                    <Box textAlign="center" py={4}>
                        <Typography variant="h6" color="text.secondary">
                            {searchTerm ? 'No products found matching your search.' : 'No products available.'}
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={handleAddClick}
                            sx={{ mt: 2 }}
                        >
                            Add Your First Product
                        </Button>
                    </Box>
                </Container>
            ) : (
                <Container maxWidth="xl">
                    <Grid container spacing={3}>
                        {filteredProducts.map((product) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                                <Card
                                    data-testid="product-card"
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        borderRadius: 1,
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                                        '&:hover': {
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                        },
                                        transition: 'box-shadow 0.2s ease-in-out'
                                    }}
                                >
                                    <CardContent sx={{ flexGrow: 1, p: 2, pb: 1 }}>
                                        <Typography
                                            variant="h6"
                                            component="h3"
                                            gutterBottom
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: '1rem',
                                                lineHeight: 1.3,
                                                color: 'text.primary',
                                                mb: 2
                                            }}
                                        >
                                            {product.name}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mb: 2,
                                                lineHeight: 1.4,
                                                minHeight: '3.5em',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {product.description || 'No description available'}
                                        </Typography>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: 'text.primary',
                                                    fontSize: '1.1rem'
                                                }}
                                            >
                                                ${product.price.toFixed(2)}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Stock: {product.stock}
                                            </Typography>
                                        </Box>
                                    </CardContent>

                                    <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: 'flex-start', gap: 1 }}>
                                        <Button
                                            size="small"
                                            variant="text"
                                            onClick={() => handleViewClick(product)}
                                            sx={{
                                                minWidth: 'auto',
                                                fontSize: '0.8rem',
                                                textTransform: 'none',
                                                color: 'text.secondary',
                                                px: 1,
                                                py: 0.5,
                                                fontWeight: 400,
                                                '&:hover': {
                                                    backgroundColor: 'transparent',
                                                    textDecoration: 'underline'
                                                }
                                            }}
                                        >
                                            👁 View
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="text"
                                            onClick={() => handleEditClick(product)}
                                            sx={{
                                                minWidth: 'auto',
                                                fontSize: '0.8rem',
                                                textTransform: 'none',
                                                color: 'primary.main',
                                                px: 1,
                                                py: 0.5,
                                                fontWeight: 400,
                                                '&:hover': {
                                                    backgroundColor: 'transparent',
                                                    textDecoration: 'underline'
                                                }
                                            }}
                                        >
                                            📝 Edit
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="text"
                                            onClick={() => handleDeleteClick(product)}
                                            sx={{
                                                minWidth: 'auto',
                                                fontSize: '0.8rem',
                                                textTransform: 'none',
                                                color: 'error.main',
                                                px: 1,
                                                py: 0.5,
                                                fontWeight: 400,
                                                '&:hover': {
                                                    backgroundColor: 'transparent',
                                                    textDecoration: 'underline'
                                                }
                                            }}
                                        >
                                            🗑 Delete
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            )}

            {/* View Product Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        minHeight: '200px'
                    }
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Product Details
                        </Typography>
                        <IconButton
                            aria-label="close"
                            onClick={() => setViewDialogOpen(false)}
                            sx={{
                                color: 'text.secondary',
                                p: 0.5
                            }}
                        >
                            ✕
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    {selectedProduct && (
                        <Box>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                                {selectedProduct.name}
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                                {selectedProduct.description}
                            </Typography>
                            <Box display="flex" justifyContent="space-between" mt={3}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Price:
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        ${selectedProduct.price}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Stock:
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {selectedProduct.stock} units
                                    </Typography>
                                </Box>
                            </Box>
                            <Box mt={2}>
                                <Typography variant="body2" color="text.secondary">
                                    Product ID:
                                </Typography>
                                <Typography variant="body1">
                                    {selectedProduct.id}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2
                    }
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Delete Product
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                        variant="outlined"
                        sx={{
                            textTransform: 'none',
                            borderColor: '#d1d5db',
                            color: 'text.secondary',
                            '&:hover': {
                                borderColor: '#9ca3af',
                                backgroundColor: 'transparent'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        variant="contained"
                        color="error"
                        sx={{
                            textTransform: 'none',
                            backgroundColor: '#dc2626',
                            '&:hover': {
                                backgroundColor: '#b91c1c'
                            }
                        }}
                    >
                        Delete Product
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add Product Dialog */}
            <Dialog
                open={addDialogOpen}
                onClose={() => setAddDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2
                    }
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Add New Product
                        </Typography>
                        <IconButton
                            aria-label="close"
                            onClick={() => setAddDialogOpen(false)}
                            sx={{
                                color: 'text.secondary',
                                p: 0.5
                            }}
                        >
                            ✕
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    <Box component="form" sx={{ mt: 1 }}>
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                            Product Name
                        </Typography>
                        <TextField
                            fullWidth
                            placeholder="Enter product name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: '#f8f9fa'
                                }
                            }}
                        />
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                            Description
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Enter product description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: '#f8f9fa'
                                }
                            }}
                        />
                        <Box display="flex" gap={2}>
                            <Box flex={1}>
                                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                    Price ($)
                                </Typography>
                                <TextField
                                    fullWidth
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: '#f8f9fa'
                                        }
                                    }}
                                />
                            </Box>
                            <Box flex={1}>
                                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                    Stock
                                </Typography>
                                <TextField
                                    fullWidth
                                    type="number"
                                    placeholder="0"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: '#f8f9fa'
                                        }
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
                    <Button
                        onClick={() => setAddDialogOpen(false)}
                        variant="outlined"
                        sx={{
                            textTransform: 'none',
                            borderColor: '#d1d5db',
                            color: 'text.secondary',
                            '&:hover': {
                                borderColor: '#9ca3af',
                                backgroundColor: 'transparent'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => handleFormSubmit(false)}
                        variant="contained"
                        disabled={!formData.name || !formData.price || !formData.stock}
                        sx={{
                            textTransform: 'none',
                            backgroundColor: '#1976d2',
                            '&:hover': {
                                backgroundColor: '#1565c0'
                            }
                        }}
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
                PaperProps={{
                    sx: {
                        borderRadius: 2
                    }
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Edit Product
                        </Typography>
                        <IconButton
                            aria-label="close"
                            onClick={() => setEditDialogOpen(false)}
                            sx={{
                                color: 'text.secondary',
                                p: 0.5
                            }}
                        >
                            ✕
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    <Box component="form" sx={{ mt: 1 }}>
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                            Product Name
                        </Typography>
                        <TextField
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: '#f8f9fa'
                                }
                            }}
                        />
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                            Description
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: '#f8f9fa'
                                }
                            }}
                        />
                        <Box display="flex" gap={2}>
                            <Box flex={1}>
                                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                    Price ($)
                                </Typography>
                                <TextField
                                    fullWidth
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: '#f8f9fa'
                                        }
                                    }}
                                />
                            </Box>
                            <Box flex={1}>
                                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                    Stock
                                </Typography>
                                <TextField
                                    fullWidth
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: '#f8f9fa'
                                        }
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
                    <Button
                        onClick={() => setEditDialogOpen(false)}
                        variant="outlined"
                        sx={{
                            textTransform: 'none',
                            borderColor: '#d1d5db',
                            color: 'text.secondary',
                            '&:hover': {
                                borderColor: '#9ca3af',
                                backgroundColor: 'transparent'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => handleFormSubmit(true)}
                        variant="contained"
                        disabled={!formData.name || !formData.price || !formData.stock}
                        sx={{
                            textTransform: 'none',
                            backgroundColor: '#1976d2',
                            '&:hover': {
                                backgroundColor: '#1565c0'
                            }
                        }}
                    >
                        Update Product
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProductList;
