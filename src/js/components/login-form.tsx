import React from 'react';
import './login-form.scss';
import i18n from './login-form.i18n';
import { RouteComponentProps } from 'react-router';
import contredanseLogo from '@assets/images/logo-contredanse.png';
import { ApplicationState } from '@src/store';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { AuthUser, loginUser } from '@src/store/auth/auth';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import { getFromDictionary } from '@src/i18n/basic-i18n';
import { appConfig } from '@config/config';
import { ExternalUrls } from '@src/core/app-config';

export type LoginFormProps = {
    handleSubmit?: (data: any, onSuccess?: () => void) => void;
    authError: string | null;
    authExpiry: string | null;
    loading: boolean;
    user?: AuthUser | null;
    authenticated: boolean;
    lang?: string;
    onSuccess?: () => void;
    externalUrls?: ExternalUrls;
} & Pick<RouteComponentProps, 'match' | 'history'>;

type LoginFormState = {};

const defaultProps = {
    authError: null,
    loading: false,
    lang: 'en',
    externalUrls: appConfig.getExternalUrls(),
};

export class LoginForm extends React.PureComponent<LoginFormProps, LoginFormState> {
    static defaultProps = defaultProps;

    constructor(props: LoginFormProps) {
        super(props);
    }

    handleSubmit = (data: any) => {
        if (this.props.handleSubmit) {
            this.props.handleSubmit(data, this.props.onSuccess);
        }
        return false;
    };

    componentDidMount(): void {}

    render() {
        const { externalUrls } = this.props;

        return (
            <div className="login-form">
                <h2>{this.tr('welcome_to_you')}</h2>

                <p>{this.tr('to_continue_text')}</p>

                <p>
                    <a className="shop_button" target="_blank" rel="noopener" href={externalUrls!.shopLink}>
                        {this.tr('get_your_12_months_access')}
                    </a>
                </p>

                <p>{this.tr('or_connect')}</p>

                <Formik
                    initialValues={{ email: '', password: '' }}
                    onSubmit={(values, { setSubmitting }) => {
                        this.handleSubmit(values);
                        setSubmitting(false);
                    }}
                    validationSchema={Yup.object().shape({
                        email: Yup.string()
                            .email(this.tr('a_valid_email_is_required'))
                            .required(this.tr('required')),
                        password: Yup.string().required(this.tr('required')),
                    })}
                >
                    {props => {
                        const { values, touched, errors, isSubmitting, handleChange, handleBlur } = props;
                        return (
                            <Form>
                                <label htmlFor="email" style={{ display: 'block' }}>
                                    {this.tr('email')}
                                </label>
                                <Field
                                    id="email"
                                    placeholder={this.tr('enter_email')}
                                    type="text"
                                    value={values.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={errors.email && touched.email ? 'text-input error' : 'text-input'}
                                />
                                {errors.email && touched.email && <div className="input-feedback">{errors.email}</div>}

                                <label htmlFor="password" style={{ display: 'block' }}>
                                    {this.tr('password')}
                                </label>
                                <Field
                                    id="password"
                                    placeholder="Password"
                                    type="password"
                                    value={values.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={errors.password && touched.password ? 'text-input error' : 'text-input'}
                                />
                                {errors.password && touched.password && (
                                    <div className="input-feedback">{errors.password}</div>
                                )}

                                {this.props.authError && (
                                    <div className="error-response-text">
                                        {this.getAuthErrorMessage(this.props.authError, this.props.authExpiry)}
                                    </div>
                                )}

                                <button type="submit" disabled={isSubmitting}>
                                    {this.tr('submit')}
                                </button>
                            </Form>
                        );
                    }}
                </Formik>

                <p>
                    <a target="_blank" rel="noopener" href={externalUrls!.resetPassword}>
                        {this.tr('password_forgotten')}
                    </a>
                </p>

                <img src={contredanseLogo} alt="Contredanse logo" />
            </div>
        );
    }

    private getAuthErrorMessage = (message: string, expiry: string | null): string => {
        const msg = this.tr(message);
        if (expiry && Date.parse(expiry)) {
            return msg.replace('%date%', new Date(expiry).toLocaleDateString(this.props.lang));
        }
        return msg;
    };

    private tr = (text: string): string => {
        return getFromDictionary(text, this.props.lang!, i18n);
    };
}

const mapStateToProps = ({ auth }: ApplicationState) => ({
    authError: auth.authError,
    authExpiry: auth.authExpiry,
    loading: auth.loading,
    user: auth.user,
    authenticated: auth.authenticated,
});

const mapDispatchToProps = (dispatch: Dispatch): Pick<LoginFormProps, 'handleSubmit'> => ({
    //handleSubmit: (data: any) => dispatch(uiActions.setFullscreen(isFullscreen)),
    handleSubmit: (data: any, onSuccess?: () => void) =>
        loginUser(data, () => {
            if (onSuccess) {
                onSuccess();
            }
        })(dispatch),
});

const ConnectedLoginForm = connect(
    mapStateToProps,
    mapDispatchToProps
)(LoginForm);

export default ConnectedLoginForm;
