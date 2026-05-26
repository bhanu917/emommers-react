import React, { useState, useEffect } from "react";

export default function Home({ data }) {
    const [ival, sival] = useState({});
    const userId = localStorage.getItem("userId");

    // load cart from API on mount
    useEffect(() => {
        const loadCart = async () => {
            const res = await fetch(`http://localhost:3006/Users/${userId}`)
            const user = await res.json()
            sival(user.cartprod || {})  // load saved cart into state
        }
        if (userId) loadCart()
    }, [userId])

    const incid = async (id) => {
        const newVal = (ival[id] || 0) + 1;
        const newCart = { ...ival, [id]: newVal };

        sival(newCart);
        localStorage.setItem("userCart", JSON.stringify(newCart));

        try {
            await fetch(`http://localhost:3006/Users/${userId}`, {
                method: "PATCH",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ cartprod: newCart })
            });
        } catch (err) {
            console.error("Failed to update cart:", err);
        }
    };

    const decid = async (id) => {
        const currentVal = ival[id] || 0;
        if (currentVal <= 1) {
            const { [id]: _, ...newCart } = ival; // remove item entirely
            sival(newCart);
            localStorage.setItem("userCart", JSON.stringify(newCart));
            await fetch(`http://localhost:3006/Users/${userId}`, {
                method: "PATCH",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ cartprod: newCart })
            });
        } else {
            const newCart = { ...ival, [id]: currentVal - 1 };
            sival(newCart);
            localStorage.setItem("userCart", JSON.stringify(newCart));
            await fetch(`http://localhost:3006/Users/${userId}`, {
                method: "PATCH",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ cartprod: newCart })
            });
        }
    };


    return (
        <div className="mt-5 container d-flex flex-wrap gap-4 justify-content-between">
            {data.map((item) => (
                <div className="card mb-4" key={item.id} style={{ width: "300px" }}>
                    <div className="card-title text-center mt-3">
                        <img src={item.image} width="250" height="300" alt={item.title} />
                    </div>
                    <div className="card-body">
                        <ul style={{ listStyle: "none" }}>
                            <li><b>Name:</b> {item.title.substring(0, 20)}</li>
                            <li><b>Price:</b> ${item.price}</li>
                            <li><b>Category:</b> {item.category}</li>
                            <li><b>Description:</b> {item.description.substring(0, 40)}</li>
                        </ul>
                        <div className="d-flex justify-content-center align-items-center">
                            <button className="btn btn-primary me-4" onClick={() => decid(item.id)}>-</button>
                            <p className="m-0">{ival[item.id] || 0}</p>
                            <button className="btn btn-primary ms-4" onClick={() => incid(item.id)}>+</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}