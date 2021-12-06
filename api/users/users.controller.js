
const { create, getUserByUserEmail, saveFile, getPictureByEmail, createBadge, getBadgesByUserEmail, fetchLocations, compareQr, getBadge } = require("./users.service");
const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const path = require('path');


module.exports = {
    //create user
    createUser: (req, res) => {
        const body = req.body;
        // password encryption
        const salt = genSaltSync(10);
        body.password = hashSync(body.password, salt);

        createBadge(body.email, (err, results) => {
            if(err) {
                console.log(err);
            }
            else {
                console.log(results);
            }
        })

        create(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection errror"
                });
            }
            return res.status(200).json({
                success: 1,
                data: results
            });
        });
    },
    // login
    login: (req, res) => {
        const body = req.body;
        getUserByUserEmail(body.email, (err, results) => {
            if(err) {
                console.log(err);
            }
            if(!results) {
                return res.json({
                    success: 0,
                    message: "Invalid email or password"
                })
            }
            const result = compareSync(body.password, results.password);
            if(result){
                return res.json({
                    success: 1,
                    message: "login successfully"
                });
            }
            else {
                return res.json({
                    success: 0,
                    data: "Invalid email or password"
                });
            }
        });
    },
    // Upload profile picture
    uploadProfilePicture: (req, res) => {
        var body = req.file;
        body.email = req.body.email;
        saveFile((body), (err, results) => {
            if(err) {
                console.log("point A", err);
            }
            if(!results) {
                return res.json({
                    success: 0,
                    message: "user does not exist"
                })
            }
            if(results) {
                return res.json({
                    success: 1,
                    message: "profile picture uploaded"
                })
            }
        })
    },
    // send profile picture back
    sendProfilePicture: (req, res) => {
        const body = req.headers;
        getUserByUserEmail(body.email, (err, results) => {
            if(err) {
                console.log(err);
            }
            if(!results) {
                return res.json({
                    success: 0,
                    message: "user not found"
                })
            }
            if(results){
                var filename = results.profile_picture.substring(results.profile_picture.lastIndexOf('/')+1);
                res.sendFile(__dirname + '/uploads/' + filename);
            }
            else {
                return res.json({
                    success: 0,
                    data: "something went wrong"
                });
            }
        });
        //res.sendFile(__dirname + '/uploads/' + results.profile_picture);
    },
    // send badges of user
    sendUserBadges: (req, res) => {
        const body = req.headers;
        getBadgesByUserEmail(body.email, (err, results) => {
            if(err) {
                console.log(err);
            }
            if(!results) {
                return res.json({
                    success: 0,
                    message: "user not found"
                })
            }
            if(results){
                var filename = results.Badge_image.substring(results.Badge_image.lastIndexOf('/')+1);
                res.sendFile(__dirname + '/uploads/' + filename);
            }
            else {
                return res.json({
                    success: 0,
                    data: "something went wrong"
                });
            }
        });
    },
    // send profile picture back
    userDetails: (req, res) => {
        const body = req.headers;
        getUserByUserEmail(body.email, (err, results) => {
            if(err) {
                console.log(err);
            }
            if(!results) {
                return res.json({
                    success: 0,
                    message: "user not found"
                })
            }
            if(results){
                return res.json({
                    success: 1,
                    username: results.username
                })
            }
            else {
                return res.json({
                    success: 0,
                    data: "something went wrong"
                });
            }
        });
    },
    // Get locations
    getLocations: (req, res) => {
        fetchLocations(req, (err, results) => {
            if(err) {
                console.log(err);
            }
            if(!results) {
                return res.json({
                    success: 0,
                    message: "record not found"
                })
            }
            if(results){
                return res.json({
                    success: 1,
                    locations: results
                })
            }
            else {
                return res.json({
                    success: 0,
                    data: "something went wrong"
                });
            }
        })
    },

    //UserScanQRCode
    userScan: (req, res) => {
        const body = req.body;
        console.log(body)
        compareQr(body.qrvalue, (err, results) => {
            if(err) {
                console.log(err);
            }
            if(!results) {
                return res.json({
                    success: 0,
                    message: "Invalid QR Code"
                })
            }
            if(results){
                var badgeImage;
                    if(body.qrvalue == "ZR"){
                        badgeImage = "api/users/upload/ZR.png"
                    }
                    else if(body.qrvalue == "ZBC"){
                        badgeImage = "api/users/upload/ZBC/png"
                    }
                var data = {
                    badge_name: "location badge",
                    badge_type: "scanner badge",
                    badge_image: badgeImage,
                    location_id: results.location_id,
                    email: body.email
                    }
                    getBadge(data, (err, results) => {
                    if(err) {
                    console.log(err);
                    }
                    else {
                    console.log(results);
                    }
                    })
                return res.json({
                    success: 1,
                    message: "QR Code successfully scanned"
                });
            }
            else {
                return res.json({
                    success: 0,
                    data: "Invalid QR Code"
                });
            }
        });
    }


    
}

