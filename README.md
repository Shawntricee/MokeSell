# MokeSell
MokeSell is an eCommerce platform designed for buying and selling second-hand furniture. Our goal is to provide users with a seamless experience in finding and listing pre-owned items and making the process more unqiue and fun. The website incoperates gamification to enhance user engagement and features a modern yet casual design with a white and brown colour palette, ensuring a visually appealing and user-friendly interface. 

MokeSell revolutionizes the furniture marketplace by combining traditional e-commerce with innovative gamification. Our platform creates a vibrant community where users don't just buy and sell - they earn rewards, compete in games, and build trust through verified reviews. Unlike typical marketplaces, MokeSell enhances the user experience through our unique Dino game feature, where users can earn points for discounts, making furniture shopping both rewarding and entertaining. The platform emphasizes user trust through detailed listings, verified reviews, and a points-based reward system.

## Design Process
 
Our development focused on creating an intuitive platform that serves both buyers and sellers while adding engaging gamification elements. The platform ensures a smooth user journey from listing items to making purchases, with intuitive navigation and filtering features that help users find what they need quickly.

Our design philosophy centered around simplicity and functionality as we wanted the website to feel approachable while maintaining an effective interface. The decision to integrate gamification was to keep users engaged and motivated through incentives like earning points and redeeming vouchers. In conclusion, the clean layout, clear navigation and structured product organisation make the platform suitable for both first-time and experienced users to buy or sell products.


### User Stories

1. **As a furniture seller**, I want to list my used furniture quickly with photos and descriptions, so that I can reach potential buyers efficiently.
    - Intuitive listing form where sellers can upload images, set   pricing, and add detailed descriptions to attract buyers
    - Numbered step-by-step listing process with a progress bar ensures sellers can track their listing progress easily

2. **As a bargain hunter**, I want to earn rewards while shopping, so I can get better deals.
   - Points system through Dino game
   - Redeemable vouchers
   - Daily rewards
   - Leaderboard competition

3. **As a buyer**, I want to trust the sellers and products, so I can make confident purchases.
   - Detailed seller profiles
   - Review system
   - Real-time chat feature
   - Clear product images and descriptions

4. **As a buyer**, I want to search and filter products easily, so that I can find furniture that fits my needs without hassle.
    - Search bar available on all pages
    - Navigation bar to navigate to categories and subcategories
    - Filter function in product page to filter by item price and condition

You can view the development wireframes here: [Figma Wireframe Link](https://www.figma.com/design/Vf6cZ8GuLS6Fa0BggLnay0/FED_Shawntrice_Serene_Assg2_Wireframe?node-id=0-1&t=GNF0VDPLMk2p0GGh-1)

## Features

### Existing Features

1. **User Authentication System** - Enables users to create an account, log in, and securely access their profiles.

2. **Product Search and Filters** - Users can browse furniture listings and refine their searches using category filters and a search function.

3. **Listing Management** - Sellers can list their second-hand furniture with detailed descriptions and images.

4. **Shopping Cart & Checkout** - Buyers can add items to their cart and complete their purchases seamlessly.

5. **Gamification System** - Users earn points through interactions like purchases and playing our dino game, which can be redeemed for vouchers.

6. **Showroom Feature** - A selection of featured furniture items to highlight how products can be used to design homes.

7. **Review and Rating System** - Users can leave reviews on products, ensuring transparency and trust in transactions.

8. **Live Chat Support** - Real-time assistance helping users navigate the platform easily.

### Features Left to Implement
1. **Integrated Payment System** - Secure and seamless checkout process with multiple payment options.

2. **Price Comparison Tool** - Automated comparison of similar listings to help buyers find best deals.

3. **Bump System** - Allow sellers to pay a small fee or use earned points to boost their listings for greater visibility.

4. **Advanced Seller Dashbaord** - A comprehensive dashboard providing sellers with analytics on sales, views, and customer engagement.

## Technologies Used

- [HTML5](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5)
    - Page structure and content organization

- [CSS3](https://developer.mozilla.org/en-US/docs/Web/CSS)
    - Styling and responsive design
    - Animation effects

- [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
    - Dynamic content and interactivity
    - Game implementation
    - Form validation

- [RestDB](https://restdb.io/)
    - Database for products, users, and game scores

- [Cloudinary](https://cloudinary.com/)
    - Image optimization and storage

- [Lottie](https://airbnb.io/lottie/)
    - Loading and success animations

## Assistive AI

1. Google Maps API Integration:
- Used Claude.AI to assist with implementing the Google Maps API for the contact page
- The AI helped with proper API key handling and map initialization
- Assisted in creating markers and custom styling

![alt text](claude.png)

## Testing

1. Authentication System:
    1. Complete the sign-up form by filling in all required fields.
    2. Attempt to sign up with an existing username or email and verify that the system displays an appropriate error message.
    3. Attempt to log in with incorrect credentials (username or password) and ensure login is unsuccessful.
    4. Sign in using the correct account details and verify that login is successful.

2. Listing Creation:
    1. Submit the product listing form with one or more required fields left empty and confirm that the system displays an error message indicating missing fields.
    2. Attempt to submit the product listing form while not signed in and verify that a relevant error message is shown, prompting user to login.
    3. Sign in and complete the product listing form with all required fields filled, then submit and verify that the product is successfully listed on the products page.

3. Dino Game System:
    1. Play the game without being signed in and confirm that points are not recorded on the leaderboard.
    2. Sign in to the system and check that the available vouchers match the points associated with the logged-in user.
    3. Play the game while signed in and verify that the points are updated correctly in both the " Your points: " field and on the leaderboard. (300 in-game points for 1 MokeSell point)

4. Product Reviews:
    1. Attempt to post a review while not signed in and confirm that the system displays an error message requesting the user to log in.
    2. Log in, post a review, and ensure that the review appears with the correct username and date associated with the account.
    3. Verify that the posted review only appears on the relevant product page and not on any other products.

5. Live Chat:
    1. Attempt to input relevant keywords, (hello, vouchers, orders) and verify that associated automessage displays correctly.

6. Responsive Design Testing:
    - Mobile testing (iOS/Android)
    - Tablet testing (iPad/Samsung)
    - Desktop testing (various resolutions)
    - Cross-browser verification (Chrome/Firefox/Safari)

### Known Issues
1. File upload occasionally slow on Firefox mobile
2. Chat notifications delayed on some mobile browsers
3. Minor UI glitches in Safari
4. Slow API loading speed

## Credits

### Content
- Product information taken from: [Article](https://www.article.com/)
- Game mechanics inspired by Chrome's Dino game
- Dino game code taken from: [Dino game](https://github.com/ImKennyYip/chrome-dinosaur-game)

### Media
- Product images from [Article](https://www.article.com/)
- Home page hero images from [Orignials](https://www.originals.com.sg/)
- Top categories images from [lofthome](https://lofthome.com/)
- Product placeholder images for showroom from [IKEA](https://www.ikea.com/sg/en/rooms/home-office/?utm_source=main-menu&utm_medium=website&utm_campaign=rooms)
- Icons from [Flaticon](https://www.flaticon.com/)
- Animations from [LottieFiles](https://lottiefiles.com)

### Acknowledgements
Inspired by:
- [Shopee](https://shopee.sg/)
- [Carousell](https://www.carousell.sg/)

### Github Page
[MokeSell Github Page](https://shawntricee.github.io/MokeSell/)