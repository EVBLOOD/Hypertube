
// auth
export interface Login {
    username: string;
    password: string;
}

export interface Register {
  username: string;
//   @IsEmail()
  email: string;
//   @MinLength(8, { message: 'Password must be at least 8 characters' })
//   @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
//     message: 'Password too weak: requires uppercase, lowercase, and a number/special char',
//   })
  password: string;
  firstName: string;
  lastName: string;
}