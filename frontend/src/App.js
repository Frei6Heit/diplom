import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './components/Auth';
import Account from './components/Account';
import Main from './components/Main';
import Settings from './components/Settings';
import Assistant from './components/Assistant';
import Decoding from './components/Decoding';
import TitleBar from './components/TitleBar';
import ProtectedRoute from './components/ProtectedRoute';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return (
        <Router>
            <TitleBar />
            <Routes>
                <Route path="/login" element={<Auth />} />

                <Route path="/" element={<Auth />} />
                <Route path="/main" element={<Main />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/assistant" element={<Assistant />} />
                <Route path="/account" element={<Account />} />
                <Route path="/decoding" element={<Decoding />} />
                
                {/* Защищенные маршруты */}
                <Route element={<ProtectedRoute />}>
                {/* <Route path="/account" element={<Account />} />
                <Route path="/main" element={<Main />} /> */}
                </Route>
                
                <Route path="*" element={<Auth />} />

                
            </Routes>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </Router>
    );
}

export default App;
