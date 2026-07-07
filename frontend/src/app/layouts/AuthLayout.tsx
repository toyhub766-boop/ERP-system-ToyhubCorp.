type AuthLayoutProps = {
  children: React.ReactNode;
};

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
      }}
    >
      {children}
    </div>
  );
};

export default AuthLayout;