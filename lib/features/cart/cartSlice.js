import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

let debounceTimer = null;

// ---------------------- UPLOAD CART ----------------------
export const uploadCart = createAsyncThunk(
  "cart/uploadCart",
  async ({ getToken }, thunkAPI) => {
    try {
      clearTimeout(debounceTimer);

      return new Promise((resolve, reject) => {
        debounceTimer = setTimeout(async () => {
          try {
            const { cartItems } = thunkAPI.getState().cart;
            const token = await getToken();

            await axios.post(
              "/api/cart",
              { cart: cartItems },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            resolve("ok");
          } catch (err) {
            reject(err);
          }
        }, 1000);
      });
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

// ---------------------- FETCH CART ----------------------
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async ({ getToken }, thunkAPI) => {
    try {
      const token = await getToken();
      const res = await axios.get("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return res.data; // { cart: {...} }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

// ---------------------- SLICE ----------------------
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    total: 0,
    cartItems: {},
  },
  reducers: {
    addToCart: (state, action) => {
      const { productId } = action.payload;
      state.cartItems[productId] = (state.cartItems[productId] || 0) + 1;
      state.total += 1;
    },
    removeFromCart: (state, action) => {
      const { productId } = action.payload;
      if (state.cartItems[productId]) {
        state.cartItems[productId]--;
        if (state.cartItems[productId] === 0)
          delete state.cartItems[productId];
        state.total -= 1;
      }
    },
    deleteItemFromCart: (state, action) => {
      const { productId } = action.payload;
      state.total -= state.cartItems[productId] || 0;
      delete state.cartItems[productId];
    },
    clearCart: (state) => {
      state.cartItems = {};
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      state.cartItems = action.payload.cart || {};
      state.total = Object.values(state.cartItems).reduce(
        (acc, qty) => acc + qty,
        0
      );
    });
  },
});

export const {
  addToCart,
  removeFromCart,
  clearCart,
  deleteItemFromCart,
} = cartSlice.actions;

export default cartSlice.reducer;
