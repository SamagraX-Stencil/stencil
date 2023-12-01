import { Test, TestingModule } from '@nestjs/testing';
import { QueryGeneratorService } from './query-generator.service';

describe('QueryGeneratorService', () => {
  let service: QueryGeneratorService;
  const applicationId = "1234-1234-1234-1234";
  const applicationIds = ["1234-1234-1234-1234", "1234-1234-1234-1234"];
  const queryString = "test";
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueryGeneratorService],
    }).compile();

    service = module.get<QueryGeneratorService>(QueryGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create getUsersByApplicationId query', () => {
    const result = JSON.stringify({
      bool: {
        must: [
          {
            nested: {
              path: "registrations",
              query: {
                bool: {
                  must: [
                    {
                      match: {
                        "registrations.applicationId": applicationId
                      }
                    }
                  ]
                }
              }
            }
          }
        ]
      }
    })

    jest.spyOn(service, 'queryUsersByApplicationId');
    expect(service.queryUsersByApplicationId(applicationId)).toBe(result);

  })

  it('should create queryUsersByApplicationIdAndQueryString query', () => {
    const result = JSON.stringify({
      bool: {
        must: [
          {
            bool: {
              must: [
                [
                  {
                    nested: {
                      path: "registrations",
                      query: {
                        bool: {
                          should: service.createMatchTags(applicationIds)
                        }
                      }
                    }
                  }
                ]
              ]
            }
          },
          {
            query_string: {
              query: queryString
            }
          }
        ]
      }
    })

    jest.spyOn(service, 'queryUsersByApplicationIdAndQueryString');
    expect(service.queryUsersByApplicationIdAndQueryString(applicationIds, queryString)).toBe(result);

  })
});
