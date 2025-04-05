import React from 'react';

const Btn = ({ title, onClick, disabled }) => {
    
    return (
              <button
                onClick={onClick}
                disabled={disabled}
                className="px-6 py-2 bg-cyan-700 text-white rounded-lg hover:bg-cyan-800 hover:cursor-pointer transition"
              >
                {title}
              </button>
    );
}

export default Btn;
