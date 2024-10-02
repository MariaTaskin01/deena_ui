import { Footer } from '@/components';
import { login } from '@/services/ant-design-pro/api';

import {
  AlipayCircleOutlined,
  LockOutlined,
  TaobaoCircleOutlined,
  UserOutlined,
  WeiboCircleOutlined,
} from '@ant-design/icons';
import { LoginForm, ProForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { FormattedMessage, Helmet, history, SelectLang, useIntl, useModel } from '@umijs/max';
import { Alert, message, Tabs } from 'antd';
import { createStyles } from 'antd-style';
import Button from 'antd/lib/button';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import Settings from '../../../../config/defaultSettings';

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      marginLeft: '8px',
      color: 'rgba(0, 0, 0, 0.2)',
      fontSize: '24px',
      verticalAlign: 'middle',
      cursor: 'pointer',
      transition: 'color 0.3s',
      '&:hover': {
        color: token.colorPrimaryActive,
      },
    },
    lang: {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    },
  };
});

const ActionIcons = () => {
  const { styles } = useStyles();

  return (
    <>
      <AlipayCircleOutlined key="AlipayCircleOutlined" className={styles.action} />
      <TaobaoCircleOutlined key="TaobaoCircleOutlined" className={styles.action} />
      <WeiboCircleOutlined key="WeiboCircleOutlined" className={styles.action} />
    </>
  );
};

const Lang = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.lang} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const [type, setType] = useState<string>('login');
  const { initialState, setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const intl = useIntl();

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };

  const handleSubmit = async (values: API.LoginParams) => {
    try {
      // 登录
      const msg = await login({ ...values, type });
      if (msg.status === 'ok') {
        const defaultLoginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        });
        message.success(defaultLoginSuccessMessage);
        await fetchUserInfo();
        const urlParams = new URL(window.location.href).searchParams;
        history.push(urlParams.get('redirect') || '/');
        return;
      }
      console.log(msg);
      // 如果失败去设置用户错误信息
      setUserLoginState(msg);
    } catch (error) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: '登录失败，请重试！',
      });
      console.log(error);
      message.error(defaultLoginFailureMessage);
    }
  };
  const { status, type: loginType } = userLoginState;

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: '登录页',
          })}
          - {Settings.title}
        </title>
      </Helmet>
      <Lang />
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          logo={<img alt="logo" src="/logo.svg" />}
          title="Deena"
          subTitle={intl.formatMessage({ id: 'pages.layouts.userLayout.title' })}
          initialValues={{
            autoLogin: true,
          }}
          actions={[
            <FormattedMessage
              key="loginWith"
              id="pages.registration.submit"
              defaultMessage="其他登录方式"
            />,
            <ActionIcons key="icons" />,
          ]}
          // Custom submitter for the registration tab
          submitter={{
            searchConfig: {
              // If type is "registration", change the button text to "Register"
              submitText: type === 'registration' ? 'Register Account' : 'Login',
            },
            render: (_, doms) => {
              // Only render the submit button, exclude reset
              return [doms[1]]; // dom[0] is usually the submit button, dom[1] might be the reset button
            }, // Keep default rendering for the button
          }}
          onFinish={async (values) => {
            await handleSubmit(values as API.LoginParams);
          }}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'login',
                label: intl.formatMessage({
                  id: 'pages.login.accountLogin.tab',
                  defaultMessage: '账户密码登录',
                }),
              },
              {
                key: 'registration',
                label: intl.formatMessage({
                  id: 'pages.login.phoneLogin.tab',
                  defaultMessage: '手机号登录',
                }),
              },
            ]}
          />

          {status === 'error' && loginType === 'login' && (
            <LoginMessage
              content={intl.formatMessage({
                id: 'pages.login.accountLogin.errorMessage',
                defaultMessage: '账户或密码错误(admin/ant.design)',
              })}
            />
          )}
          {type === 'login' && (
            <div>
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.username.placeholder',
                  defaultMessage: '用户名: admin or user',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.username.required"
                        defaultMessage="请输入用户名!"
                      />
                    ),
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.password.placeholder',
                  defaultMessage: '密码: ant.design',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.password.required"
                        defaultMessage="请输入密码！"
                      />
                    ),
                  },
                ]}
              />
            </div>
          )}

          {status === 'error' && loginType === 'registration' && (
            <LoginMessage content="验证码错误" />
          )}
          {type === 'registration' && (
            <div className="flex justify-center items-center flex-col">
              <div className="w-[500px]">
                <div className="grid grid-cols-2 gap-x-6 px-2 py-1">
                  <ProFormText
                    fieldProps={{
                      width: 'lg',
                      size: 'large',
                      // prefix: <MobileOutlined />,
                    }}
                    name="username"
                    label={intl.formatMessage({
                      id: 'pages.registration.username.label',
                    })}
                    placeholder={intl.formatMessage({
                      id: 'pages.registration.username.placeholder',
                      defaultMessage: '手机号',
                    })}
                    rules={[
                      {
                        required: true,
                        message: (
                          <FormattedMessage
                            id="pages.registration.username.required"
                            defaultMessage="请输入手机号！"
                          />
                        ),
                      },
                    ]}
                  />
                  <ProFormText
                    fieldProps={{
                      size: 'large',
                      // prefix: <MobileOutlined />,
                    }}
                    name="email"
                    label={intl.formatMessage({
                      id: 'pages.registration.email.label',
                    })}
                    placeholder={intl.formatMessage({
                      id: 'pages.registration.email.placeholder',
                      defaultMessage: '手机号',
                    })}
                    rules={[
                      {
                        required: true,
                        message: (
                          <FormattedMessage
                            id="pages.registration.email.required"
                            defaultMessage="请输入手机号！"
                          />
                        ),
                      },
                    ]}
                  />
                  <ProFormText
                    fieldProps={{
                      size: 'large',
                      // prefix: <MobileOutlined />,
                    }}
                    name="studentName"
                    label={intl.formatMessage({
                      id: 'pages.registration.fullName.label',
                    })}
                    placeholder={intl.formatMessage({
                      id: 'pages.registration.studentName.placeholder',
                      defaultMessage: '手机号',
                    })}
                    rules={[
                      {
                        required: true,
                        message: (
                          <FormattedMessage
                            id="pages.registration.studentName.required"
                            defaultMessage="请输入手机号！"
                          />
                        ),
                      },
                    ]}
                  />
                  <ProFormText
                    fieldProps={{
                      size: 'large',
                      // prefix: <MobileOutlined />,
                    }}
                    name="phone"
                    label={intl.formatMessage({
                      id: 'pages.registration.phone.label',
                    })}
                    placeholder={intl.formatMessage({
                      id: 'pages.registration.phone.placeholder',
                      defaultMessage: '手机号',
                    })}
                    rules={[
                      {
                        required: true,
                        message: (
                          <FormattedMessage
                            id="pages.registration.phone.required"
                            defaultMessage="请输入手机号！"
                          />
                        ),
                      },
                    ]}
                  />
                  <ProFormSelect
                    fieldProps={{
                      size: 'large',
                      // prefix: <MobileOutlined />,
                    }}
                    name="User Type"
                    label={intl.formatMessage({
                      id: 'pages.registration.userType.label',
                    })}
                    placeholder={intl.formatMessage({
                      id: 'pages.registration.userType.placeholder',
                      defaultMessage: '手机号',
                    })}
                    rules={[
                      {
                        required: true,
                        message: (
                          <FormattedMessage
                            id="pages.registration.userType.required"
                            defaultMessage="请输入手机号！"
                          />
                        ),
                      },
                    ]}
                    options={[
                      {
                        label: 'Student',
                        value: 'STUDENT',
                      },
                      {
                        label: 'Teacher',
                        value: 'TEACHER',
                      },
                      {
                        label: 'Staff',
                        value: 'STAFF',
                      },
                      {
                        label: 'Admin',
                        value: 'ADMIN',
                      },
                    ]}
                  />
                  <ProFormText
                    fieldProps={{
                      size: 'large',
                      // prefix: <MobileOutlined />,
                    }}
                    name="password"
                    label={intl.formatMessage({
                      id: 'pages.registration.password.label',
                    })}
                    placeholder={intl.formatMessage({
                      id: 'pages.registration.password.placeholder',
                      defaultMessage: '手机号',
                    })}
                    rules={[
                      {
                        required: true,
                        message: (
                          <FormattedMessage
                            id="pages.registration.password.required"
                            defaultMessage="请输入手机号！"
                          />
                        ),
                      },
                    ]}
                  />
                </div>

                <ProFormText
                  fieldProps={{
                    size: 'large',
                    // prefix: <MobileOutlined />,
                  }}
                  name="confirmPassword"
                  label={intl.formatMessage({
                    id: 'pages.registration.confirmPassword.label',
                  })}
                  placeholder={intl.formatMessage({
                    id: 'pages.registration.confirmPassword.placeholder',
                    defaultMessage: '手机号',
                  })}
                  rules={[
                    {
                      required: true,
                      message: (
                        <FormattedMessage
                          id="pages.registration.confirmPassword.required"
                          defaultMessage="请输入手机号！"
                        />
                      ),
                    },
                  ]}
                />
              </div>
            </div>
          )}
          <ProForm.Item>
            <Button
              className="flex justify-center"
              type="primary"
              htmlType="submit"
              style={{ width: '100%', height: '200%' }}
            >
              {type === 'registration' ? 'Register Account' : 'Login'}
            </Button>
          </ProForm.Item>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
