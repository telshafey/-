import React from 'react';

const StudentLayout: React.FC<{children: React.ReactNode}> = ({children}) => {
    return (
        <div>
            <h1>Student Dashboard</h1>
            <main>{children}</main>
        </div>
    );
}

export default StudentLayout;
