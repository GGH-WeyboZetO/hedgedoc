/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { IsString } from 'class-validator';

export class UserInfoDto {
  @IsString()
  userName: string;
  @IsString()
  displayName: string;
  @IsString()
  photo: string;
  @IsString()
  email: string;
}
