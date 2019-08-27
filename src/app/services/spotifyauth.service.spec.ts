import { TestBed } from '@angular/core/testing';

import { SpotifyauthService } from './spotifyauth.service';

describe('SpotifyauthService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SpotifyauthService = TestBed.get(SpotifyauthService);
    expect(service).toBeTruthy();
  });
});
