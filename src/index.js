import React from 'react';
import ReactDOM from 'react-dom/client';
import { RecoilRoot } from 'recoil';
import './index.css';
import Modal from 'react-modal';
import App from './App';
import 'semantic-ui-css/semantic.min.css';

Modal.setAppElement('#root');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <RecoilRoot>
      <App />
    </RecoilRoot>
);