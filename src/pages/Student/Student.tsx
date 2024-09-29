import { PageContainer, ProFormText } from '@ant-design/pro-components';
import React from 'react';

const Student = () => {
    return (
        <PageContainer>
            <ProFormText name="studentId" initialValue="" placeholder="Enter Student ID">

            </ProFormText>
        </PageContainer>
    );
};

export default Student;