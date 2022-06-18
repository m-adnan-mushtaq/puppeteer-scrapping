const express= require('express')
const app= express()
const puppeteer = require('puppeteer'); // Require the Package we need...

// ---------------------express- setup----------------
app.use('*/css',express.static(__dirname+'/public/css'))
app.use('*/js',express.static(__dirname+'/public/js'))
app.use(express.static(__dirname+'/public'))
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.set('view engine','ejs')
// function that handles all reviews
// const fetchReviews=require('./middlwares/fetchReviews')

//----------------- index route---------------------
app.get('/',(req,res)=>{
    res.render('index')
})
let scrape = async (url) => { // Prepare scrape...

    const browser = await puppeteer.launch()
    const page = await browser.newPage(); // Create request for the new page to obtain...
    // Replace with your Google Maps URL... Or Test the Microsoft one...
    await page.goto(url,{waitUntil:'networkidle2'}); // Define the Maps URL to Scrape...
    // await page.waitFor(1000); // In case Server has JS needed to be loaded...
    const result = await page.evaluate(() => { // Let's create variables and store values...
        // grab all elements 
        // let business_name= document.querySelector('span[jstcache="796"]').innerText
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
        return resultsArr
    });
    browser.close(); // Close the Browser...
    return result; // Return the results with the Review...
};


// -----------------------review routes---------------------
app.get('/reviews',async (req,res)=>{
let defaultUrl='https://www.google.com/maps/place/AdRightly/@31.4108014,73.1048334,17z/data=!3m1!4b1!4m5!3m4!1s0x392269a5e2335e19:0x2c8498e2574a3634!8m2!3d31.4107968!4d73.1070221'
    scrape(defaultUrl).then((value) => { // Scrape and output the results...
        res.render('review',{reviewsArr:value,website:'AdRightly'})
    }).catch((error) => {
        console.log(error);
        res.sendStatus(500)
    });
    
})

// post route------------------
app.post('/reviews',async(req,res)=>{
    let url=req.body.url.trim()
    scrape(url).then((value) => { // Scrape and output the results...
        res.render('review',{reviewsArr:value})
    }).catch((error) => {
        console.log(error);
        res.status(403).redirect('/reviews')
    });
})



app.listen(process.env.PORT || 3000,()=>console.log('Server is started at http://localhost:3000/'))