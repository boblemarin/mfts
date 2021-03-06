import React from 'react';
import './login-page.scss';
import { RouteComponentProps, withRouter } from 'react-router';

import ConnectedLoginForm from '@src/components/login-form';
import { getMainMenuRoute } from '@src/helpers/main-menu-redirect';

export type LoginPageProps = {
    lang?: string;
} & RouteComponentProps<any>;

type LoginPageState = {};

const defaultProps = {
    lang: 'en',
};

export class LoginPage extends React.PureComponent<LoginPageProps, LoginPageState> {
    static defaultProps = defaultProps;

    constructor(props: LoginPageProps) {
        super(props);
    }

    handleLoginSuccess = () => {
        const { lang, history } = this.props;
        // redirect to helix/search page
        history.push(getMainMenuRoute(lang!));
    };

    render() {
        const { lang } = this.props;
        return (
            <div className="login-page-container">
                <ConnectedLoginForm
                    lang={lang}
                    match={this.props.match}
                    history={this.props.history}
                    onSuccess={this.handleLoginSuccess}
                />
            </div>
        );
    }
}

export default withRouter(LoginPage);
