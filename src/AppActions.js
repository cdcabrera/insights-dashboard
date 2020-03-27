import * as ActionTypes from './AppConstants';

import API from './Utilities/Api';

const fetchData = async (url, headers, options) => {
    await window.insights.chrome.auth.getUser();
    return (await API.get(url, headers, options)).data;
};

export const fetchComplianceSummary = (options) => ({
    type: ActionTypes.COMPLIANCE_FETCH,
    payload: fetchData(ActionTypes.COMPLIANCE_FETCH_URL, {}, options)
});

export const fetchVulnerabilities = (options) => ({
    type: ActionTypes.VULNERABILITIES_FETCH,
    payload: fetchData(ActionTypes.VULNERABILITIES_FETCH_URL, {}, options)
});

export const advisorFetchStatsRecs = (options) => ({
    type: ActionTypes.ADVISOR_STATS_REC_FETCH,
    payload: fetchData(ActionTypes.ADVISOR_STATS_REC_FETCH_URL, {}, options)
});

export const advisorFetchStatsSystems = (options) => ({
    type: ActionTypes.ADVISOR_STATS_SYSTEMS_FETCH,
    payload: fetchData(ActionTypes.ADVISOR_STATS_SYSTEMS_FETCH_URL, {}, options)
});

export const advisorFetchIncidents = (options) => ({
    type: ActionTypes.ADVISOR_INCIDENTS_FETCH,
    payload: fetchData(ActionTypes.ADVISOR_INCIDENTS_FETCH_URL, {}, options)
});

export const patchmanFetchSystems = (options) => ({
    type: ActionTypes.PATCHMAN_SYSTEMS_FETCH,
    payload: fetchData(ActionTypes.PATCHMAN_SYSTEMS_FETCH_URL, {}, options)
});

export const patchmanFetchSecurity = (options) => ({
    type: ActionTypes.PATCHMAN_SECURITY_FETCH,
    payload: fetchData(ActionTypes.PATCHMAN_SECURITY_FETCH_URL, {}, options)
});

export const patchmanFetchBugs = (options) => ({
    type: ActionTypes.PATCHMAN_BUGS_FETCH,
    payload: fetchData(ActionTypes.PATCHMAN_BUGS_FETCH_URL, {}, options)
});

export const patchmanFetchEnhancements = (options) => ({
    type: ActionTypes.PATCHMAN_ENHANCEMENTS_FETCH,
    payload: fetchData(ActionTypes.PATCHMAN_ENHANCEMENTS_FETCH_URL, {}, options)
});

export const subscriptionsUtilizedOpenShiftFetch = options => ({
    type: ActionTypes.SUBSCRIPTIONS_UTILIZED_OPENSHIFT_FETCH,
    payload: Promise.all([
        fetchData(ActionTypes.SUBSCRIPTIONS_UTILIZED_OPENSHIFT_REPORT_FETCH_URL, {}, options),
        fetchData(ActionTypes.SUBSCRIPTIONS_UTILIZED_OPENSHIFT_CAPACITY_FETCH_URL, {}, options)
    ])
});

export const subscriptionsUtilizedRhelFetch = options => ({
    type: ActionTypes.SUBSCRIPTIONS_UTILIZED_RHEL_FETCH,
    payload: Promise.all([
        fetchData(ActionTypes.SUBSCRIPTIONS_UTILIZED_RHEL_REPORT_FETCH_URL, {}, options),
        fetchData(ActionTypes.SUBSCRIPTIONS_UTILIZED_RHEL_CAPACITY_FETCH_URL, {}, options)
    ])
});
