import { Test, TestingModule } from '@nestjs/testing';

import { UserDBService } from './user-db.service';

describe('UserDbService', () => {
  let service: UserDBService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserDBService],
    }).compile();

    service = module.get<UserDBService>(UserDBService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // it('should return school', async () => {
  //   service.url = 'http://localhost:8000';
  //   service.teacherPartUrl = '/api/v5/drf/teacher/';
  //   service.schoolPartUrl = '/api/v5/drf/school/';
  //   const school = await service.getSchool('2052104703');
  //   expect(school.status).toEqual(true);
  //   expect(school.id).toEqual(34828);
  // });
});
