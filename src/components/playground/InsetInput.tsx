import React from 'react';
import globeSvg from './globe.svg';
import tasksSvg from './tasks.svg';

const InsetInput: React.FC = () => {
    return (
        <div className="inset-input-container">
            <div className="inset-input-light">
                <div className="inset-input-pill inset-input-pill-light">
                    <img src={globeSvg.src} alt="" className="inset-input-icon" />
                    <span className="inset-input-label">Web Scraper</span>
                </div>
            </div>
            <div className="inset-input-dark">
                <div className="inset-input-pill inset-input-pill-dark">
                    <img src={tasksSvg.src} alt="" className="inset-input-icon" />
                    <span className="inset-input-label">Task Agent</span>
                </div>
            </div>
        </div>
    );
};

export default InsetInput;
