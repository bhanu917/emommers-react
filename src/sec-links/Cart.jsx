import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Cart({ data }) {
    const [cartprod, setCartprod] = useState({});
    const userId = localStorage.getItem("userId");

    // load cart from API on mount
    useEffect(() => {
        const loadCart = async () => {
            const res = await fetch(`http://localhost:3006/Users/${userId}`)
            const user = await res.json()
            setCartprod(user.cartprod || {})
        }
        if (userId) loadCart()
    }, [userId])

    const incid = async (id) => {
        const newVal = (cartprod[id] || 0) + 1
        const newCart = { ...cartprod, [id]: newVal }
        setCartprod(newCart)
        await fetch(`http://localhost:3006/Users/${userId}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ cartprod: newCart })
        })
    }

    const decid = async (id) => {
        const currentVal = cartprod[id] || 0;
        let newCart;
        if (currentVal <= 1) {
            const { [id]: _, ...rest } = cartprod;
            newCart = rest;
        } else {
            newCart = { ...cartprod, [id]: currentVal - 1 };
        }
        setCartprod(newCart);
        try {
            await fetch(`http://localhost:3006/Users/${userId}`, {
                method: "PATCH",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ cartprod: newCart }),
            });
        } catch (err) {
            console.error("Failed to update cart:", err);
        }
    };

    const removeItem = async (id) => {
        const newCart = { ...cartprod }
        delete newCart[id]  // remove product completely
        setCartprod(newCart)
        await fetch(`http://localhost:3006/Users/${userId}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ cartprod: newCart })
        })
    }

    // filter only products that are in cart (quantity > 0)
    const cartItems = data.filter(item => cartprod[item.id] > 0)

    // calculate total price
    const total = cartItems.reduce((sum, item) => {
        return sum + (item.price * cartprod[item.id])
    }, 0)

    if (cartItems.length === 0) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "80vh" }}>
                <h3>Your cart is empty</h3>
                <Link to="/" className="btn btn-primary mt-3">Continue Shopping</Link>
            </div>
        )
    }

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Your Cart</h2>
            <table className="table table-bordered">
                <thead className="table-dark">
                    <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Subtotal</th>
                        <th>Remove</th>
                    </tr>
                </thead>
                <tbody>
                    {cartItems.map(item => (
                        <tr key={item.id}>
                            <td>
                                <img src={item.image} width="60" height="70" alt={item.title} />
                            </td>
                            <td>{item.title.substring(0, 30)}</td>
                            <td>${item.price}</td>
                            <td>
                                <div className="d-flex align-items-center gap-2">
                                    <button className="btn btn-sm btn-primary" onClick={() => decid(item.id)}>-</button>
                                    <span>{cartprod[item.id]}</span>
                                    <button className="btn btn-sm btn-primary" onClick={() => incid(item.id)}>+</button>
                                </div>
                            </td>
                            <td>${(item.price * cartprod[item.id]).toFixed(2)}</td>
                            <td>
                                <button className="btn btn-sm btn-danger" onClick={() => removeItem(item.id)}>Remove</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan="4" className="text-end fw-bold">Total:</td>
                        <td colSpan="2" className="fw-bold">${total.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
            <div className="d-flex justify-content-between mt-3">
                <Link to="/" className="btn btn-secondary">Continue Shopping</Link>
                <button className="btn btn-success">Checkout</button>
            </div>
        </div>
    )
}