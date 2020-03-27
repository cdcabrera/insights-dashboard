import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment/moment';
import Immutable from 'seamless-immutable';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { TemplateCard, TemplateCardBody, TemplateCardHeader } from '../../PresentationalComponents/Template/TemplateCard';
import { ProgressTemplate } from '../../../../insights-dashboard/src/ChartTemplates/Progress/ProgressTemplate';
import messages from '../../Messages';

import * as AppActions from '../../AppActions';
import { RHSM_API_RESPONSE_DATA, RHSM_API_RESPONSE_DATA_TYPES } from './Constants';

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
        const { subscriptionsUtilizedOpenShiftFetch, subscriptionsUtilizedRhelFetch } = this.props;
        const { startDate, endDate } = SubscriptionsUtilizedCard.setRangedDateTime();
        const options = {
            granularity: 'DAILY',
            beginning: startDate.toISOString(),
            ending: endDate.toISOString()
        };

        subscriptionsUtilizedOpenShiftFetch(options);
        subscriptionsUtilizedRhelFetch(options);
    }

    /**
     * Prepare chart data for filtering.
     *
     * @returns {{openshift: ({}|{ date: Date, report: (number|null|undefined),
     *     capacity: (number|null|undefined), percentage: (number|null|undefined) }),
     *     rhel: ({}|{ date: Date, report: (number|null|undefined),
     *     capacity: (number|null|undefined), percentage: (number|null|undefined) })}}
     */
    setChartData() {
        const { subscriptionsUtilizedOpenShift,
            subscriptionsUtilizedOpenShiftFetchStatus, subscriptionsUtilizedRhel, subscriptionsUtilizedRhelFetchStatus } = this.props;
        const chartData = { openshift: {}, rhel: {} };

        if (subscriptionsUtilizedOpenShiftFetchStatus === 'fulfilled' || subscriptionsUtilizedRhelFetchStatus === 'fulfilled') {
            const [openshiftReport = {}, openshiftCapacity = {}] = Immutable.asMutable(subscriptionsUtilizedOpenShift, { deep: true }) || [];
            const [rhelReport = {}, rhelCapacity = {}] = Immutable.asMutable(subscriptionsUtilizedRhel, { deep: true }) || [];

            chartData.openshift = SubscriptionsUtilizedCard.filterChartData(
                openshiftReport[RHSM_API_RESPONSE_DATA],
                openshiftCapacity[RHSM_API_RESPONSE_DATA],
                [RHSM_API_RESPONSE_DATA_TYPES.SOCKETS]
            );

            chartData.rhel = SubscriptionsUtilizedCard.filterChartData(
                rhelReport[RHSM_API_RESPONSE_DATA],
                rhelCapacity[RHSM_API_RESPONSE_DATA],
                [RHSM_API_RESPONSE_DATA_TYPES.CORES]
            );
        }

        return chartData;
    }

    /**
     * ToDo: Subscriptions data display
     * Tooltips: temp copy, apply real copy, spacing adjustment
     * Progress bar: loading and/or disabled versions, use "*FetchStatus" props
     * Progress bar: Title links for RHEL and OpenShift towards Subscription Watch. Plan for Summit is to have Subs Watch within "stable"
     *    RHEL, [/beta]/subscriptions/rhel-sw/all
     *    OpenShift, [/beta]/subscriptions/openshift-sw
     * Locale: if applicable, apply towards product names, tooltip content.
     */
    /**
     * Render a chart/progressbar.
     *
     * @return {Node}
     */
    render() {
        const { intl } = this.props;
        const { openshift, rhel } = this.setChartData();

        const rhelTooltip = (
            <ul>
                <li>Report/Sockets: {rhel.report}</li>
                <li>Capacity/Threshold: {rhel.capacity}</li>
            </ul>
        );

        const openshiftTooltip = (
            <ul>
                <li>Report/Cores: {openshift.report}</li>
                <li>Capacity/Threshold: {openshift.capacity}</li>
            </ul>
        );

        const charts = [
            <Tooltip key="rhel" content={ rhelTooltip } position={ TooltipPosition.top } distance={ -30 }>
                <ProgressTemplate
                    title="Red Hat Enterprise Linux"
                    value={ (rhel.percentage <= 100 && rhel.percentage) || 0 }
                    label={ `${rhel.percentage}%` }
                    variant={ (rhel.percentage <= 100 && 'info') || (rhel.percentage > 100 && 'danger') }
                />
            </Tooltip>,
            <Tooltip key="openshift" content={ openshiftTooltip } position={ TooltipPosition.top } distance={ -30 }>
                <ProgressTemplate
                    title="Red Hat OpenShift"
                    value={ (openshift.percentage <= 100 && openshift.percentage) || 0 }
                    label={ `${openshift.percentage}%` }
                    variant={ (openshift.percentage <= 100 && 'info') || (openshift.percentage > 100 && 'danger') }
                />
            </Tooltip>
        ];

        return (
            <TemplateCard appName='SubscriptionsUtilized'>
                <TemplateCardHeader subtitle={ intl.formatMessage(messages.subscriptionsUtilized) }/>
                <TemplateCardBody>
                    {(openshift.percentage > rhel.percentage && openshift.percentage > 100) ? charts.reverse() : charts}
                </TemplateCardBody>
            </TemplateCard>
        );
    }
}

SubscriptionsUtilizedCard.propTypes = {
    intl: PropTypes.any,
    subscriptionsUtilizedOpenShift: PropTypes.array,
    subscriptionsUtilizedOpenShiftFetch: PropTypes.func,
    subscriptionsUtilizedOpenShiftFetchStatus: PropTypes.string,
    subscriptionsUtilizedRhel: PropTypes.array,
    subscriptionsUtilizedRhelFetch: PropTypes.func,
    subscriptionsUtilizedRhelFetchStatus: PropTypes.string
};

const mapStateToProps = state => ({
    subscriptionsUtilizedOpenShift: state.DashboardStore.subscriptionsUtilizedOpenShift,
    subscriptionsUtilizedOpenShiftFetchStatus: state.DashboardStore.subscriptionsUtilizedOpenShiftFetchStatus,
    subscriptionsUtilizedRhel: state.DashboardStore.subscriptionsUtilizedRhel,
    subscriptionsUtilizedRhelFetchStatus: state.DashboardStore.subscriptionsUtilizedRhelFetchStatus
});

const mapDispatchToProps = dispatch => ({
    subscriptionsUtilizedOpenShiftFetch: options => dispatch(AppActions.subscriptionsUtilizedOpenShiftFetch(options)),
    subscriptionsUtilizedRhelFetch: options => dispatch(AppActions.subscriptionsUtilizedRhelFetch(options))
});

const ConnectedSubscriptionsUtilizedCard = injectIntl(connect(mapStateToProps, mapDispatchToProps)(SubscriptionsUtilizedCard));

export { ConnectedSubscriptionsUtilizedCard as default, ConnectedSubscriptionsUtilizedCard, SubscriptionsUtilizedCard };
