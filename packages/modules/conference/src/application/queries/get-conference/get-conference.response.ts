/**
 * GetConferenceResponse - Reuses the creation response contract: both
 * endpoints return the public `ConferenceApiResponse` shape, so a single
 * DTO class serves both CQRS use cases (DRY).
 */
export {CreateConferenceResponse as GetConferenceResponse} from '../../commands/create-conference/create-conference.response.js';
