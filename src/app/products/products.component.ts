// ...existing code...
addToCart(product: any) {
  const payload = {
    productId: product.id,
    quantity: 1, // Example: Ensure the quantity is included
    // Add other required fields here
  };

  console.log('Sending payload to server:', payload); // Debugging log

  this.http.post('http://localhost:5000/api/cart', payload).subscribe({
    next: (response) => {
      console.log('Product added to cart successfully:', response);
    },
    error: (error) => {
      console.error('Error adding product to cart:', error);
      alert('Failed to add product to cart. Please try again.');
    },
  });
}
// ...existing code...
