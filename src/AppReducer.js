import * as ActionTypes from './AppConstants';

import Immutable from 'seamless-immutable';

// eslint-disable-next-line new-cap
const initialState = Immutable({
    complianceSummary: {},
    complianceFetchStatus: '',
    vulnerabilities: {},
    vulnerabilitiesFetchStatus: '',
    advisorStatsRecs: {},
    advisorStatsRecsStatus: '',
    advisorStatsSystems: {},
    advisorStatsSystemsStatus: '',
    advisorIncidents: {},
    advisorIncidentsStatus: '',
    patchmanSystems: {},
    patchmanSystemsStatus: '',
    patchmanSecurity: {},
    patchmanSecurityStatus: '',
    patchmanBugs: {},
    patchmanBugsStatus: '',
    patchmanEnhancements: {},
    patchmanEnhancementsStatus: '',
    subscriptionsUtilizedOpenShift: [],
    subscriptionsUtilizedOpenShiftFetchStatus: '',
    subscriptionsUtilizedRhel: [],
    subscriptionsUtilizedRhelFetchStatus: ''
});

export const DashboardStore = (state = initialState, action) => {
    switch (action.type) {
        // COMPLIANCE
        case `${ActionTypes.COMPLIANCE_FETCH}_PENDING`:
            return state.set('complianceFetchStatus', 'pending');
        case `${ActionTypes.COMPLIANCE_FETCH}_FULFILLED`:
            return Immutable.merge(state, {
                complianceSummary: action.payload,
                complianceFetchStatus: 'fulfilled'
            });
        case `${ActionTypes.COMPLIANCE_FETCH}_REJECTED`:
            return state.set('complianceFetchStatus', 'rejected');

        // VULN
        case `${ActionTypes.VULNERABILITIES_FETCH}_PENDING`:
            return state.set('vulnerabilitiesFetchStatus', 'pending');
        case `${ActionTypes.VULNERABILITIES_FETCH}_FULFILLED`:
            return Immutable.merge(state, {
                vulnerabilities: action.payload,
                vulnerabilitiesFetchStatus: 'fulfilled'
            });
        case `${ActionTypes.VULNERABILITIES_FETCH}_REJECTED`:
            return state.set('vulnerabilitiesFetchStatus', 'rejected');

        // Advisor
        case `${ActionTypes.ADVISOR_STATS_REC_FETCH}_PENDING`:
            return state.set('advisorStatsRecsStatus', 'pending');
        case `${ActionTypes.ADVISOR_STATS_REC_FETCH}_FULFILLED`:
            return Immutable.merge(state, {
                advisorStatsRecs: action.payload,
                advisorStatsRecsStatus: 'fulfilled'
            });
        case `${ActionTypes.ADVISOR_STATS_REC_FETCH}_REJECTED`:
            return state.set('advisorStatsRecsStatus', 'rejected');

        case `${ActionTypes.ADVISOR_STATS_SYSTEMS_FETCH}_PENDING`:
            return state.set('advisorStatsSystemsStatus', 'pending');
        case `${ActionTypes.ADVISOR_STATS_SYSTEMS_FETCH}_FULFILLED`:
            return Immutable.merge(state, {
                advisorStatsSystems: action.payload,
                advisorStatsSystemsStatus: 'fulfilled'
            });
        case `${ActionTypes.ADVISOR_STATS_SYSTEMS_FETCH}_REJECTED`:
            return state.set('advisorStatsSystemsStatus', 'rejected');

        case `${ActionTypes.ADVISOR_INCIDENTS_FETCH}_PENDING`:
            return state.set('advisorIncidentsStatus', 'pending');
        case `${ActionTypes.ADVISOR_INCIDENTS_FETCH}_FULFILLED`:
            return Immutable.merge(state, {
                advisorIncidents: action.payload,
                advisorIncidentsStatus: 'fulfilled'
            });
        case `${ActionTypes.ADVISOR_INCIDENTS_FETCH}_REJECTED`:
            return state.set('advisorIncidentsStatus', 'rejected');

        // Patch
        case `${ActionTypes.PATCHMAN_SYSTEMS_FETCH}_PENDING`:
            return state.set('patchmanSystemsStatus', 'pending');

        case `${ActionTypes.PATCHMAN_SYSTEMS_FETCH}_FULFILLED`:
            return Immutable.merge(state, {
                patchmanSystems: action.payload.meta.total_items,
                patchmanSystemsStatus: 'fulfilled'
            });
        case `${ActionTypes.PATCHMAN_SYSTEMS_FETCH}_REJECTED`:
            return state.set('patchmanSystemsStatus', 'rejected');

        case `${ActionTypes.PATCHMAN_SECURITY_FETCH}_PENDING`:
            return state.set('patchmanSecurityStatus', 'pending');

        case `${ActionTypes.PATCHMAN_SECURITY_FETCH}_FULFILLED`:
            return Immutable.merge(state, {
                patchmanSecurity: action.payload.meta.total_items,
                patchmanSecurityStatus: 'fulfilled'
            });

        case `${ActionTypes.PATCHMAN_SECURITY_FETCH}_REJECTED`:
            return state.set('patchmanBugsStatus', 'rejected');

        case `${ActionTypes.PATCHMAN_BUGS_FETCH}_PENDING`:
            return state.set('patchmanBugsStatus', 'pending');

        case `${ActionTypes.PATCHMAN_BUGS_FETCH}_FULFILLED`:
            return Immutable.merge(state, {
                patchmanBugs: action.payload.meta.total_items,
                patchmanBugsStatus: 'fulfilled'
            });

        case `${ActionTypes.PATCHMAN_BUGS_FETCH}_REJECTED`:
            return state.set('patchmanBugsStatus', 'rejected');

        case `${ActionTypes.PATCHMAN_ENHANCEMENTS_FETCH}_PENDING`:
            return state.set('patchmanEnhancementsStatus', 'pending');

        case `${ActionTypes.PATCHMAN_ENHANCEMENTS_FETCH}_FULFILLED`:
            return Immutable.merge(state, {
                patchmanEnhancements: action.payload.meta.total_items,
                patchmanEnhancementsStatus: 'fulfilled'
            });

        case `${ActionTypes.PATCHMAN_ENHANCEMENTS_FETCH}_REJECTED`:
            return state.set('patchmanEnhancementsStatus', 'rejected');

        // SubsUtilizedOpenShift
        case `${ActionTypes.SUBSCRIPTIONS_UTILIZED_OPENSHIFT_FETCH}_PENDING`:
            return state.set('subscriptionsUtilizedOpenShiftFetchStatus', 'pending');
        case `${ActionTypes.SUBSCRIPTIONS_UTILIZED_OPENSHIFT_FETCH}_FULFILLED`:
            return Immutable.merge(state, {
                subscriptionsUtilizedOpenShift: action.payload,
                subscriptionsUtilizedOpenShiftFetchStatus: 'fulfilled'
            });
        case `${ActionTypes.SUBSCRIPTIONS_UTILIZED_OPENSHIFT_FETCH}_REJECTED`:
            return state.set('subscriptionsUtilizedOpenShiftFetchStatus', 'rejected');

        // SubsUtilizedRhel
        case `${ActionTypes.SUBSCRIPTIONS_UTILIZED_RHEL_FETCH}_PENDING`:
            return state.set('subscriptionsUtilizedRhelFetchStatus', 'pending');
        case `${ActionTypes.SUBSCRIPTIONS_UTILIZED_RHEL_FETCH}_FULFILLED`:
            return Immutable.merge(state, {
                subscriptionsUtilizedRhel: action.payload,
                subscriptionsUtilizedRhelFetchStatus: 'fulfilled'
            });
        case `${ActionTypes.SUBSCRIPTIONS_UTILIZED_RHEL_FETCH}_REJECTED`:
            return state.set('subscriptionsUtilizedRhelFetchStatus', 'rejected');

        default:
            return state;
    }
};
