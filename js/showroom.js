const API_ENDPOINT = ''; //API endpoint

class ShowroomManager {
    constructor() {
        this.initializeHotspots();
        this.initializeImageGallery();
        this.initializeShopButtons();
        this.initializeLazyLoading();
    }

    initializeHotspots() {
        const hotspots = document.querySelectorAll('.hotspot');
        
        hotspots.forEach(hotspot => {
            //position the content based on screen edges
            hotspot.addEventListener('mouseenter', () => {
                const content = hotspot.querySelector('.hotspot-content');
                const rect = content.getBoundingClientRect();
                const viewport = {
                    width: window.innerWidth,
                    height: window.innerHeight
                };

                //adjust position if content goes off screen
                if (rect.right > viewport.width) {
                    content.style.left = 'auto';
                    content.style.right = '0';
                }
                if (rect.bottom > viewport.height) {
                    content.style.top = 'auto';
                    content.style.bottom = '0';
                }
            });

            //load product data when hovering
            hotspot.addEventListener('mouseenter', async () => {
                const productId = hotspot.dataset.product;
                if (!hotspot.dataset.loaded) {
                    try {
                        await this.loadProductData(hotspot, productId);
                        hotspot.dataset.loaded = 'true';
                    } catch (error) {
                        console.error('Error loading product data:', error);
                    }
                }
            });
        });
    }

    async loadProductData(hotspot, productId) {
        try {
            const response = await fetch(`${API_ENDPOINT}/products/${productId}`);
            if (!response.ok) throw new Error('Failed to load product data');
            
            const data = await response.json();
            const content = hotspot.querySelector('.hotspot-content');
            
            content.innerHTML = `
                <img src="${data.image}" alt="${data.name}">
                <div class="product-info">
                    <h3>${data.name}</h3>
                    <p>$${data.price}</p>
                    <button class="shop-button">Shop now</button>
                </div>
            `;
        } catch (error) {
            console.error('Error:', error);
        }
    }

    initializeImageGallery() {
        const galleryImages = document.querySelectorAll('.home-image img');
        
        galleryImages.forEach(img => {
            img.addEventListener('click', () => {
                this.openGalleryModal(img.src);
            });
        });
    }

    openGalleryModal(imageSrc) {
        const modal = document.createElement('div');
        modal.className = 'gallery-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="close-modal">×</button>
                <img src="${imageSrc}" alt="Gallery image">
                <div class="modal-products">
                    <!-- Products in the image will be loaded here -->
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.loadModalProducts(imageSrc, modal);

        //close modal on click outside or close button
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.className === 'close-modal') {
                modal.remove();
            }
        });
    }

    async loadModalProducts(imageSrc, modal) {
        try {
            const response = await fetch(`${API_ENDPOINT}/image-products?image=${encodeURIComponent(imageSrc)}`);
            if (!response.ok) throw new Error('Failed to load image products');
            
            const products = await response.json();
            const productsContainer = modal.querySelector('.modal-products');
            
            productsContainer.innerHTML = products.map(product => `
                <div class="modal-product">
                    <img src="${product.thumbnail}" alt="${product.name}">
                    <div class="product-info">
                        <h4>${product.name}</h4>
                        <p>$${product.price}</p>
                        <button class="shop-button" data-product-id="${product.id}">Shop now</button>
                    </div>
                </div>
            `).join('');

            //add click handlers for shop buttons
            productsContainer.querySelectorAll('.shop-button').forEach(button => {
                button.addEventListener('click', () => {
                    window.location.href = `/product.html?id=${button.dataset.productId}`;
                });
            });
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    initializeShopButtons() {
        document.querySelectorAll('.shop-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const card = e.target.closest('[data-product-id]');
                if (card) {
                    const productId = card.dataset.productId;
                    window.location.href = `/product.html?id=${productId}`;
                }
            });
        });
    }

    initializeLazyLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
}

//add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

//initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ShowroomManager();

    //add CSS class for fade-in animations
    document.querySelectorAll('.workspace-card, .look-card, .home-image').forEach(el => {
        el.classList.add('fade-in');
    });
});