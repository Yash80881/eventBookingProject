import React from 'react';
import api from '../utils/axios';
export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) =>{
    const [user,setUser] = React.useState(null);
    const [loading,setLoading] = React.useState(true);

    React.useEffect(()=>{
        const storedUser = localStorage.getItem("user");
        if(storedUser){
            setUser(JSON.parse(storedUser));
        } 
        setLoading(false);
    },[]);

    const login = async (email,password) =>{
        try{
            const {data} = await api.post('/auth/login',{email,password});
            setUser(data);
            localStorage.setItem("user",JSON.stringify(data));
            localStorage.setItem("token",data.token);
            return data;
        }
        catch(err){
            console.error("Login failed:",err);
            // Normalize server response for unverified accounts
            const serverMessage = err?.response?.data?.error || err.message || err;
            const e = new Error(serverMessage);
            if (typeof serverMessage === 'string' && serverMessage.toLowerCase().includes('not verified')) {
                e.needsVerification = true;
            }
            throw e;
        }
        
    };

    const register = async (name,email,password) => {
        try{
            const {data} = await api.post('/auth/register',{ name, email, password});
            // Server returns a message and email; do not set authenticated user here
            return data;
        }
        catch(err){
            console.error("Registration failed:",err);
            const serverMessage = err?.response?.data?.error || err.message || err;
            throw new Error(serverMessage);
        }
    }

    const verifyOtp = async (email, otp) => {
        try{
            const {data} = await api.post('/auth/verify',{ email, otp });
            setUser(data);
            localStorage.setItem("user",JSON.stringify(data));
            localStorage.setItem("token",data.token);
            return data;
        }
        catch(err){
            console.error("OTP verification failed:",err);
            const serverMessage = err?.response?.data?.error || err.message || err;
            throw new Error(serverMessage);
        }
    }

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value = {{user, loading, login, logout, verifyOtp, verifyOTP: verifyOtp, register}}>
            {children}
        </AuthContext.Provider>
    );
};