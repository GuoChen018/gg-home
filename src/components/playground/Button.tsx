import React from 'react';

const Button: React.FC = () => {
    return (
        <div className="playground-container">
            <div className="button-side button-side-light">
                <div className="button-square button-square-light"></div>
            </div>
            <div className="button-side button-side-dark">
                <div className="button-square button-square-dark"></div>
            </div>
        </div>
    );
};

export default Button;

