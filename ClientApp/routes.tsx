import * as React from 'react';
import { Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import SMS from './components/SMS';

export const routes = <Layout>
    <Route exact path='/' component={ SMS } />
</Layout>;
