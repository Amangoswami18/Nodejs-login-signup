const express = require('express')
const app = express();

const bcrypt = require('bcryptjs')

app.use(express.urlencoded({ extended: true })); // post ka data ke liye Middleware
app.use(express.static('public/')) // static file sareve

app.get('/',(req,res)=>{
    res.render("home.ejs")
})

// import config 
const connection = require('./config/db')

// import models
const UserSignup = require('./models/user')

// config multer 

const multer = require('multer');

 const storage=multer.diskStorage({
     destination:'public/uploads/',
     filename:(req,file,cb)=>{
        // store file name uniqe so it will not relace same name file
        cb(null, Date.now() + "_" + file.originalname);
     }
 })

// initializze
const upload = multer({storage:storage})

// Creat operation for File uploading
app.post('/signup', upload.single('profilePic'), async (req, res) => {
  try {
    const { name, age, email, password } = req.body;
    const profilePic = req.file ? req.file.filename : null;

       const hashpass = await bcrypt.hash(password,10)


    const newUser = new UserSignup({
      name,
      age,
      email,
      password :hashpass,
      profilePic
    });

    await newUser.save();
res.send(`
  <script>
    alert("Signup successful! Please login.");
    window.location.href = "/login";
  </script>
`);  }   // move to login page
catch (err) {
    console.log("Error during signup:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get('/login',(req,res)=>{
    res.render("Login.ejs")
})

app.post('/loginData', async (req, res) => {
  try {
    // email check
    const user = await UserSignup.findOne({ email: req.body.email });

    if (!user) {
      return res.send(`
        <script>
          alert("Email not found!");
          window.location.href = "/login"; 
        </script>
      `);
    }
    // compare password
    const validPass = await bcrypt.compare(req.body.password, user.password);

    if (validPass) {
      //  render dashboard with user data
      res.render("Profile.ejs", { user });
    } else {
      res.send(`
        <script>
          alert("Invalid Password!");
          window.location.href = "/login"; 
        </script>
      `);
    }
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).send("Internal Server Error");
  }
});

// delete profile 
app.get('/logout/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    await UserSignup.findByIdAndDelete(userId); // user delete from DB
    res.send(`
      <script>
        alert("Your account has been deleted!");
        window.location.href = "/login";
      </script>
    `);
  } catch (err) {
    console.error("Error during logout & delete:", err);
    res.status(500).send("Internal Server Error");
  }
});


// edit profle 
app.get('/edit/:id', async (req, res) => {
  try {
    const user = await UserSignup.findById(req.params.id);
    res.render('Edit.ejs', { user });
  } catch (err) {
    console.error("Error fetching user for edit:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Update Logic
app.post('/edit/:id', upload.single('profilePic'), async (req, res) => {
  try {
    const { name, age, email } = req.body;
    const updateData = { name, age, email };

    // Agar new profile pic upload ki hai toh uske liye
    if (req.file) {
      updateData.profilePic = req.file.filename;
    }

    // Update user
    await UserSignup.findByIdAndUpdate(req.params.id, updateData);

    // Update ke baad fresh data fetch karo
    const updatedUser = await UserSignup.findById(req.params.id);

    // Ab updated user ke sath dashboard (Profile.ejs) render karo
    res.render("Profile.ejs", { user: updatedUser });

  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).send("Internal Server Error");
  }
});



const HOST = "127.0.0.1"
const PORT = 3000

app.listen(PORT,()=>{
console.log(`server is running on http://${HOST}:${PORT}`);

})