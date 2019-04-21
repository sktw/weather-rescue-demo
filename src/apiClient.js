// apiClient for development
// by default will use mock apiClient from test/apiClientMock
// setting url parameter env=production will use panoptes-client
// for production builds webpack's NormalModuleReplacementPlugin is used to replace references to this module with panoptes-client

import panoptesApiClient from 'panoptes-client/lib/api-client';
import mockApiClient from '../test/apiClientMock';

const urlParams = new URLSearchParams(window.location.search);
const production = urlParams.get('env') === 'production';

const apiClient = production ? panoptesApiClient : mockApiClient;
export default apiClient;
