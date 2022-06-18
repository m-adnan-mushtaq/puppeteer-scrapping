const { use } = require('express/lib/router');
const puppeteer = require('puppeteer')
const defaultUrl = 'https://www.google.com/maps/place/AdRightly/@31.4108014,73.1048334,17z/data=!3m1!4b1!4m5!3m4!1s0x392269a5e2335e19:0x2c84'

// create user function 
// function createUser(uname,stars,review,postTime,imagePath) {

//     // return user

// }
module.exports = function (url = defaultUrl) {
    return function (req, res, next) {
        let scrape = async () => { // Prepare scrape...

            const browser = await puppeteer.launch()
            const page = await browser.newPage(); // Create request for the new page to obtain...
            
            // Replace with your Google Maps URL... Or Test the Microsoft one...
            await page.goto(url); // Define the Maps URL to Scrape...
            await page.waitFor(1000); // In case Server has JS needed to be loaded...

            const result = await page.evaluate(() => { // Let's create variables and store values...
                // grab all elements 
                let resultsArr = []
                // make a review obj
                let all_names = document.querySelectorAll('.ODSEW-ShBeI-title')
                let all_images = document.querySelectorAll('.ODSEW-ShBeI-t1uDwd-HiaYvf')
                // console.log(all_images[0].src);
                let all_stars = document.querySelectorAll('.ODSEW-ShBeI-H1e3jb')
                let all_review_messages = document.querySelectorAll('.ODSEW-ShBeI-text')
                let all_posted_dates = document.querySelectorAll('.ODSEW-ShBeI-RgZmSc-date')
                // if (all_names.length && all_images.length && all_stars.length && all_review_messages.length && all_posted_dates.length) {


                for (let i = 0; i < all_names.length; i++) {
                    // make new user
                    let uname = all_names[i].querySelector('span').innerText
                    let image = all_images[i].src
                    let stars = all_stars[i].getAttribute('aria-label')
                    let review = all_review_messages[i].innerText
                    let postDate = all_posted_dates[i].innerText
                    // let user= createUser(uname,stars,review,postDate,image)
                    let user = {}
                    user.uname = uname;
                    user.stars = stars
                    user.review = review
                    user.postTime = postDate
                    user.imagePath = image
                    resultsArr.push(user)
                }
                // }  

                // let fullName = document.querySelector('.ODSEW-ShBeI-title').querySelector('span').innerText; // Full Name
                // let userImg = document.querySelector('.ODSEW-ShBeI-t1uDwd-HiaYvf').src
                // let postDate = document.querySelector('.ODSEW-ShBeI-RgZmSc-date').innerText; // Date Posted
                // let starRating = document.querySelector('.ODSEW-ShBeI-H1e3jb').getAttribute(""); // Star Rating
                // let postReview = document.querySelector('.ODSEW-ShBeI-text').innerText; // Review Posted by Full Name aka Poster

                return resultsArr
            });

            browser.close(); // Close the Browser...
            return result; // Return the results with the Review...
        };

        scrape().then((value) => { // Scrape and output the results...
            console.log('middleware: ', value);
            req.response = value
            next()
        }).catch((error) => {
            console.log(error);
            res.sendStatus(500)
        });
    }
}