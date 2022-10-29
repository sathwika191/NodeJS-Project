const request = require('request');
const express = require('express')
const app = express();
const port = 3000;

const { initializeApp, cert } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')

const serviceAccount = require('./key.json')

initializeApp({
    credential: cert(serviceAccount)
});

const db=getFirestore();

app.set("view engine","ejs")
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.get('/signup', (req, res) => {
    res.render("signup");
  })
app.get('/signupsubmit',(req,res)=>{
  const first_name=req.query.firstname;
    const last_name=req.query.lastname;
  const email=req.query.email;
    const password=req.query.pwd;

    db.collection('users').add({
      name:first_name +last_name,
      email:email,
      password:password
    }).then(() =>{
      res.render("signin");
    })
});
  app.get('/signin', (req, res) => {
    res.render("signin");
  })
  app.get('/signinfail',(req,res)=>{
    res.render("signinfail");
  })
app.get('/signinsubmit',(req,res) =>{
  const email=req.query.email;
    const password=req.query.password;
     db.collection("users")
     .where("email","==",email)
     .where("password","==",password)
     .get()
     .then((docs) =>{
      if(docs.size> 0){
        res.render("movie");
      }
      else{
        res.render("signinfail");
      }
     });
});

app.get('/moviesubmit',(req,res) =>{
  const title = req.query.title;
  console.log(title);

  request(
    'http://www.omdbapi.com/?apikey=7821bd44&t='+title, function (error, response, body){
      if("error" in JSON.parse(body))
      {
        if((JSON.parse(body).error.code.toString()).length > 0)
        {
          res.render("movie");
        }
      }
      else
      {
        const Title = JSON.parse(body).Title;
        const Released= JSON.parse(body).Released;
        const Director = JSON.parse(body).Director;
        const Language= JSON.parse(body).Language;
        const Country= JSON.parse(body).Country;
        const Genre= JSON.parse(body).Genre;
        let Value=JSON.parse(body).Ratings.Value;
        


       res.render('title',{Title:Title,Released:Released,Director:Director,Language:Language,Country:Country,Genre:Genre,Value:Value});
        
      } 
    }
    );
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})