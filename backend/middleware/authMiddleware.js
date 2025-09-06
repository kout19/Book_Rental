import admin from 'firebase-admin';
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
           projectId: process.env.FIREBASE_PROJECT_ID,
           clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
           privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
    });
}
export const protect = async (req, res, next) =>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try{
            token= req.headers.authorization.split(' ')[1];
            const decodedToken = await admin.auth().verifyIdToken(token);
            req.user={
                id: decodedToken.uid,
                email: decodedToken.email
            };
             return next();
        }catch (error) {
            console.error("Error verifying token:", error);
            return res.status(401).json({message: "Not authorized, token failed" });
        }
     }
     if(!token){
    return res.status(401).json({message: "Not authorized, no token" });
}
} ;

