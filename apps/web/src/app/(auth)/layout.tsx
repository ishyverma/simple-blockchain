const AuthLayout = ({children}: {
    children: React.ReactNode
}) => {
    return (  
        <div className="h-[100vh] w-[100vw] flex items-center justify-center">
            {children}
        </div>
    );
}
 
export default AuthLayout;