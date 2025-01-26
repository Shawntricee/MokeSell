document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'https://mokesell-d5a1.restdb.io/rest/products';

    fetch(apiUrl, {
        headers: {
            'x-apikey': '679377f88459083ff6097e55', // Replace with your actual API key
        },
    })
    .then((response) => response.json())
    .then((data) => {
        console.log('Fetched data:', data); // Log the response data

        // Check if the data is an array and has products
        if (Array.isArray(data) && data.length > 0) {
            populateProductDetails(data[0]); // Display details for the first product
        } else {
            console.error('No products found in API response.');
        }
    })
    .catch((error) => console.error('Error fetching product data:', error));
});

function populateProductDetails(product) {
    // Debugging: Check if product is correctly passed
    console.log('Product:', product);

    // Product title
    const productTitleElement = document.getElementById('productTitle');
    if (productTitleElement) {
        productTitleElement.textContent = product.title || 'No Title Available';
    }

    // Product price
    const productPriceElement = document.getElementById('productPrice');
    if (productPriceElement) {
        productPriceElement.textContent = `S$${product.price || '0.00'}`;
    }

    // Product details
    const productCategoryElement = document.getElementById('productCategory');
    if (productCategoryElement) {
        productCategoryElement.textContent = product.category || 'N/A';
    }

    const productConditionElement = document.getElementById('productCondition');
    if (productConditionElement) {
        productConditionElement.textContent = product.condition || 'N/A';
    }

    const productListedElement = document.getElementById('productListed');
    if (productListedElement) {
        productListedElement.textContent = product.listed || 'N/A';
    }

    const productDimensionsElement = document.getElementById('productDimensions');
    if (productDimensionsElement) {
        productDimensionsElement.textContent = product.dimensions || 'N/A';
    }

    const productColourElement = document.getElementById('productColour');
    if (productColourElement) {
        productColourElement.textContent = product.colour || 'N/A';
    }

    const productMaterialElement = document.getElementById('productMaterial');
    if (productMaterialElement) {
        productMaterialElement.textContent = product.material || 'N/A';
    }

    // Product description
    const productDescriptionElement = document.getElementById('productDescription');
    if (productDescriptionElement) {
        productDescriptionElement.textContent = product.description || 'No description available.';
    }
}

