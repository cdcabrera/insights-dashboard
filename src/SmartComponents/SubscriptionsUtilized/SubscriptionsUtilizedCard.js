import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment/moment';
import Immutable from 'seamless-immutable';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { TemplateCard, TemplateCardBody, TemplateCardHeader } from '../../PresentationalComponents/Template/TemplateCard';
import Loading from '../../PresentationalComponents/Loading/Loading';
import { ProgressTemplate } from '../../../../insights-dashboard/src/ChartTemplates/Progress/ProgressTemplate';
import messages from '../../Messages';
import * as AppActions from '../../AppActions';
import { setRangedDateTime, filterChartData } from './SubscriptionsUtilizedHelpers';
import { RHSM_API_RESPONSE_DATA, RHSM_API_RESPONSE_DATA_TYPES, RHSM_API_PRODUCT_ID_TYPES, RHSM_API_QUERY_GRANULARITY_TYPES } from './Constants';

/**
 * Subscriptions utilized card for showing the portion of Subscriptions used.
 */
const SubscriptionsUtilizedCard = ({ intl, subscriptionsUtilizedProductOne, subscriptionsUtilizedProductOneFetch,
    subscriptionsUtilizedProductOneFetchStatus, subscriptionsUtilizedProductTwo, subscriptionsUtilizedProductTwoFetch,
    subscriptionsUtilizedProductTwoFetchStatus }) => {

    const [products, setProducts] = useState([]);

    useEffect(() => {
        const { startDate, endDate } = setRangedDateTime();
        const options = {
            granularity: RHSM_API_QUERY_GRANULARITY_TYPES.DAILY,
            beginning: startDate.toISOString(),
            ending: endDate.toISOString()
        };

        subscriptionsUtilizedProductOneFetch(RHSM_API_PRODUCT_ID_TYPES.OPENSHIFT, options);
        subscriptionsUtilizedProductTwoFetch(RHSM_API_PRODUCT_ID_TYPES.RHEL, options);
    }, [
        subscriptionsUtilizedProductOneFetch,
        subscriptionsUtilizedProductTwoFetch
    ]);

    useEffect(() => {
        const chartData = { productOne: {}, productTwo: {} };

        if (subscriptionsUtilizedProductOneFetchStatus === 'fulfilled' || subscriptionsUtilizedProductTwoFetchStatus === 'fulfilled') {
            const [productOneReport = {}, productOneCapacity = {}] = Immutable.asMutable(subscriptionsUtilizedProductOne, { deep: true }) || [];
            const [productTwoReport = {}, productTwoCapacity = {}] = Immutable.asMutable(subscriptionsUtilizedProductTwo, { deep: true }) || [];

            chartData.productOne = filterChartData(
                productOneReport[RHSM_API_RESPONSE_DATA],
                productOneCapacity[RHSM_API_RESPONSE_DATA],
                [RHSM_API_RESPONSE_DATA_TYPES.SOCKETS]
            );

            chartData.productTwo = filterChartData(
                productTwoReport[RHSM_API_RESPONSE_DATA],
                productTwoCapacity[RHSM_API_RESPONSE_DATA],
                [RHSM_API_RESPONSE_DATA_TYPES.CORES]
            );
        }

        setProducts(chartData);
    }, [
        subscriptionsUtilizedProductOne,
        subscriptionsUtilizedProductTwo,
        subscriptionsUtilizedProductOneFetchStatus,
        subscriptionsUtilizedProductTwoFetchStatus
    ]);

    const { productOne = {}, productTwo = {} } = products;

    const productTwoTooltip = (
        <ul>
            <li>RHEL sockets: {productTwo.report}</li>
            <li>Subscription threshold: {productTwo.capacity}</li>
            <li>Data from: {moment.utc(productTwo.date).format('MMM D, YYYY')}</li>
        </ul>
    );
    const productOneTooltip = (
        <ul>
            <li>OpenShift Cores: {productOne.report}</li>
            <li>Subscription threshold: {productOne.capacity}</li>
            <li>Data from: {moment.utc(productOne.date).format('MMM D, YYYY')}</li>
        </ul>
    );

    const charts = [
        (subscriptionsUtilizedProductTwoFetchStatus === 'fulfilled' &&
            <Tooltip key="productTwo" content={ productTwoTooltip } position={ TooltipPosition.top } distance={ -30 }>
                <ProgressTemplate
                    title="Red Hat Enterprise Linux"
                    value={ (productTwo.percentage <= 100 && productTwo.percentage) || 0 }
                    label={ `${productTwo.percentage}%` }
                    variant={ (productTwo.percentage <= 100 && 'info') || (productTwo.percentage > 100 && 'danger') }
                />
            </Tooltip>) || <Loading key="productTwoLoad" />,
        (subscriptionsUtilizedProductOneFetchStatus === 'fulfilled' &&
            <Tooltip key="productOne" content={ productOneTooltip } position={ TooltipPosition.top } distance={ -30 }>
                <ProgressTemplate
                    title="Red Hat OpenShift"
                    value={ (productOne.percentage <= 100 && productOne.percentage) || 0 }
                    label={ `${productOne.percentage}%` }
                    variant={ (productOne.percentage <= 100 && 'info') || (productOne.percentage > 100 && 'danger') }
                />
            </Tooltip>) || <Loading key="productOneLoad" />
    ];

    return (
        <TemplateCard appName='SubscriptionsUtilized'>
            <TemplateCardHeader subtitle={ intl.formatMessage(messages.subscriptionsUtilized) }/>
            <TemplateCardBody>
                {(productOne.percentage > productTwo.percentage && productOne.percentage > 100) ? charts.reverse() : charts}
            </TemplateCardBody>
        </TemplateCard>
    );
};

SubscriptionsUtilizedCard.propTypes = {
    intl: PropTypes.any,
    subscriptionsUtilizedProductOne: PropTypes.array,
    subscriptionsUtilizedProductOneFetch: PropTypes.func,
    subscriptionsUtilizedProductOneFetchStatus: PropTypes.string,
    subscriptionsUtilizedProductTwo: PropTypes.array,
    subscriptionsUtilizedProductTwoFetch: PropTypes.func,
    subscriptionsUtilizedProductTwoFetchStatus: PropTypes.string
};

const mapStateToProps = state => ({
    subscriptionsUtilizedProductOne: state.DashboardStore.subscriptionsUtilizedProductOne,
    subscriptionsUtilizedProductOneFetchStatus: state.DashboardStore.subscriptionsUtilizedProductOneFetchStatus,
    subscriptionsUtilizedProductTwo: state.DashboardStore.subscriptionsUtilizedProductTwo,
    subscriptionsUtilizedProductTwoFetchStatus: state.DashboardStore.subscriptionsUtilizedProductTwoFetchStatus
});

const mapDispatchToProps = dispatch => ({
    subscriptionsUtilizedProductOneFetch: (productId, options) => dispatch(AppActions.subscriptionsUtilizedProductOneFetch(productId, options)),
    subscriptionsUtilizedProductTwoFetch: (productId, options) => dispatch(AppActions.subscriptionsUtilizedProductTwoFetch(productId, options))
});

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(SubscriptionsUtilizedCard));
