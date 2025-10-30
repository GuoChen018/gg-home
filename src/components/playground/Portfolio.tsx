import { useState } from 'react';

export default function Portfolio() {
    const [count, setCount] = useState(0);

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>Portfolio Prototype</h1>
            <p>This is where your React prototype goes!</p>
            <button onClick={() => setCount(count + 1)}>
                Clicked {count} times
            </button>
        </div>
    );
}

