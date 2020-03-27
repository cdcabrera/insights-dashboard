import React, { Component } from 'react';
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
import { RHSM_API_RESPONSE_DATA, RHSM_API_RESPONSE_DATA_TYPES, RHSM_API_PRODUCT_ID_TYPES } from './Constants';

/**
 * Subscriptions utilized card for showing the portion of Subscriptions used.
 */
class SubscriptionsUtilizedCard extends Component {
    componentDidMount() {
        this.getChartData();
    }

    /**
     * Generate a range of dates.
     *
     * @param {Date} date
     * @param {number} subtract
     * @param {string} measurement
     * @returns {{endDate: Date, startDate: Date}}
     */
    static setRangedDateTime(date = new Date(), subtract = 1, measurement = 'days') {
        return {
            startDate: moment
            .utc(date)
            .startOf(measurement)
            .subtract(subtract, measurement)
            .toDate(),
            endDate: moment
            .utc(date)
            .startOf(measurement)
            .endOf('days')
            .toDate()
        };
    }

    /**
     * Apply a set of schemas using either an array of objects in the
     * form of [{ madeUpKey: 'some_api_key' }], or an array of arrays
     * in the form of [['some_api_key','another_api_key']]
     *
     * @param {Array} schemas
     * @param {*} initialValue
     * @returns {Array}
     */
    static setResponseSchemas(schemas = [], initialValue) {
        return schemas.map(schema => {
            const generated = {};
            const arr = (Array.isArray(schema) && schema) || Object.values(schema);

            arr.forEach(value => {
                generated[value] = initialValue;
            });

            return generated;
        });
    }

    /**
     * Filter report and capacity data against expected API response schema. Apply percentage.
     *
     * @param {Array} report
     * @param {Array} capacity
     * @param {string} filter
     * @return {({}|{date: Date, report: (number|null|undefined), capacity: (number|null|undefined), percentage: (number|null|undefined)})}
     */
    static filterChartData(report = [], capacity = [], filter) {
        const reportData = report.reverse();
        const capacityData = capacity.reverse();
        let chartData = {};

        const [responseSchema = {}] = SubscriptionsUtilizedCard.setResponseSchemas([
            RHSM_API_RESPONSE_DATA_TYPES
        ]);

        for (let index = 0; index < reportData.length; index++) {
            const value = reportData[index];
            if (value[RHSM_API_RESPONSE_DATA_TYPES.HAS_DATA] === false) {
                continue;
            }

            const date = value[RHSM_API_RESPONSE_DATA_TYPES.DATE];
            chartData = {
                date,
                report: { ...responseSchema, ...value },
                capacity: { ...responseSchema, ...capacityData[index] },
                percentage: undefined
            };

            chartData.report = chartData.report[filter];
            chartData.capacity = chartData.capacity[RHSM_API_RESPONSE_DATA_TYPES.HAS_INFINITE] ? null : chartData.capacity[filter];
            let percentage = chartData.capacity === null ? null : ((chartData.report || 0) / (chartData.capacity || 0)) * 100;

            if (Number.isNaN(percentage)) {
                percentage = 0;
            }

            if (!Number.isFinite(percentage)) {
                percentage = undefined;
            }

            if (typeof percentage === 'number') {
                percentage = Math.ceil(percentage);
            }

            chartData.percentage = percentage;
            break;
        }

        return chartData;
    }

    /**
     * Call the RHSM APIs.
     */
    getChartData() {
        const { subscriptionsUtilizedProductOneFetch, subscriptionsUtilizedProductTwoFetch } = this.props;
        const { startDate, endDate } = SubscriptionsUtilizedCard.setRangedDateTime();
        const options = {
            granularity: 'DAILY',
            beginning: startDate.toISOString(),
            ending: endDate.toISOString()
        };

        subscriptionsUtilizedProductOneFetch(RHSM_API_PRODUCT_ID_TYPES.OPENSHIFT, options);
        subscriptionsUtilizedProductTwoFetch(RHSM_API_PRODUCT_ID_TYPES.RHEL, options);
    }

    /**
     * Prepare chart data for filtering.
     *
     * @returns {{productOne: ({}|{ date: Date, report: (number|null|undefined),
     *     capacity: (number|null|undefined), percentage: (number|null|undefined) }),
     *     productTwo: ({}|{ date: Date, report: (number|null|undefined),
     *     capacity: (number|null|undefined), percentage: (number|null|undefined) })}}
     */
    setChartData() {
        const { subscriptionsUtilizedProductOne,
            subscriptionsUtilizedProductOneFetchStatus, subscriptionsUtilizedProductTwo, subscriptionsUtilizedProductTwoFetchStatus } = this.props;
        const chartData = { productOne: {}, productTwo: {} };

        if (subscriptionsUtilizedProductOneFetchStatus === 'fulfilled' || subscriptionsUtilizedProductTwoFetchStatus === 'fulfilled') {
            const [productOneReport = {}, productOneCapacity = {}] = Immutable.asMutable(subscriptionsUtilizedProductOne, { deep: true }) || [];
            const [productTwoReport = {}, productTwoCapacity = {}] = Immutable.asMutable(subscriptionsUtilizedProductTwo, { deep: true }) || [];

            chartData.productOne = SubscriptionsUtilizedCard.filterChartData(
                productOneReport[RHSM_API_RESPONSE_DATA],
                productOneCapacity[RHSM_API_RESPONSE_DATA],
                [RHSM_API_RESPONSE_DATA_TYPES.SOCKETS]
            );

            chartData.productTwo = SubscriptionsUtilizedCard.filterChartData(
                productTwoReport[RHSM_API_RESPONSE_DATA],
                productTwoCapacity[RHSM_API_RESPONSE_DATA],
                [RHSM_API_RESPONSE_DATA_TYPES.CORES]
            );
        }

        return chartData;
    }

    /**
     * Render a chart/progressbar.
     *
     * @return {Node}
     */
    render() {
        const { intl, subscriptionsUtilizedProductOneFetchStatus, subscriptionsUtilizedProductTwoFetchStatus } = this.props;
        const { productOne, productTwo } = this.setChartData();

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
    }
}

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
