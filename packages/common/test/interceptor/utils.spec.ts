import { 
    generateBaseJSON, 
    generateRow, 
    generateTextPanel, 
    getDashboardByUID, 
    getDashboardJSON 
  } from '../../src/interceptors/utils'; 
  import axios from 'axios';
  
  jest.mock('axios');
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  
  describe('Utils Functions', () => {
    test('generateBaseJSON should return the expected structure', () => {
      const result = generateBaseJSON();
      expect(result).toHaveProperty('meta');
      expect(result).toHaveProperty('dashboard');
      expect(result.meta.slug).toBe('Response_Times');
      expect(result.dashboard.title).toBe('Response_Times');
    });
  
    test('generateRow should format title correctly', () => {
      const name = 'test_row';
      const result = generateRow(name);
      expect(result.title).toBe('Test Row');
      expect(result.collapsed).toBe(true);
      expect(result.panels).toHaveLength(5);
    });
  
    test('generateTextPanel should create a panel with correct properties', () => {
      const title = 'Sample Title';
      const text = 'Sample Text';
      const result = generateTextPanel(title, text);
      expect(result.title).toBe(title);
      expect(result.options.content).toBe(text);
    });
  
    test('getDashboardByUID should call axios with correct URL', async () => {
      const uid = 'testUID';
      const grafanaBaseURL = 'http://localhost:3000';
      const apiToken = 'testToken';
      const mockResponse = { data: { title: 'Test Dashboard' } };
      
      mockedAxios.get.mockResolvedValue(mockResponse);
  
      const result = await getDashboardByUID(uid, grafanaBaseURL, apiToken);
      expect(mockedAxios.get).toHaveBeenCalledWith(`${grafanaBaseURL}/api/dashboards/uid/${uid}`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      });
      expect(result).toEqual(mockResponse.data);
    });
  
    test('getDashboardJSON should filter dashboards correctly', async () => {
      const token = 'testToken';
      const dashboardTitle = 'Test Dashboard';
      const grafanaBaseURL = 'http://localhost:3000';
      const mockResponse = { data: [{ title: 'Test Dashboard' }, { title: 'Other Dashboard' }] };
  
      mockedAxios.get.mockResolvedValue(mockResponse);
  
      const result = await getDashboardJSON(token, dashboardTitle, grafanaBaseURL);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe(dashboardTitle);
    });
  });
  