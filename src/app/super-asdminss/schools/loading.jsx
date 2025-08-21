// src/app/loading.js

import React from 'react';

const Loader = () => {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div
                className="w-16 h-16 border-4 border-t-4 border-gray-200 rounded-full animate-spin border-t-indigo-500"></div>
        </div>
    );
};

export default Loader;