## Core features

The key benefit for the applications using user service is that they get to use the readily available backend APIs which they do not need to maintain or manage it is taken care by the user service! 

The following section dives deep into the core features of User Service:

### 1. Login & Sign-Up feature

User service provides login services for user Login and Registration. 

- **Log-In**: With the User service Login, The organization can configure log-in portals into their  applications. The user credentials are stored in the organization auth (like Fusion Auth). The User service provides a ready-made API, which can be leveraged by the application to connect with its Auth for allowing Login.

- **Sign Up** : User service also provides APIs for creating your own users and creating the entries for the users in the application's auth (Like Fusion Auth). User service can integrate with Application Auth through configuration. It allows for dynamic user attributes to be sent, as per the application's requirements. You can view the user service fusion auth service backend [here](/src/admin/fusionauth/).

### 2. Reset/Forgot Password 

There are cases, When a user creates a profile but is unable to recall his current password or the user credentials are lost due to some reasons. In such cases, a system to reset the existing password may be very helpful to the user. 

We can:

- Invoke a reset password functionality from user service in our applications. If a case arises where the user has forgotten his password he can simply click on the “reset password” button. This action will take the user to a different portal where he will be asked to enter his mobile number in a textfield.

- This exact functionality can be achieved by entering only our username. e-Samwad is an android app that also uses the User service reset password portal.

The user service currently supports two providers for the SMS, they are:
[Gupshup](/src/user/sms/gupshup/) and [CDAC](/src/user/sms/cdac/)

**More providers can be contributed to the user service by the community.**

### 3. Role Based Access Control

Role-based access control (RBAC) is a method of regulating access to computer or network resources based on the roles of individual users within your organization. RBAC ensures people access only information they need to do their jobs and prevents them from accessing information that doesn't concern them.

With user service RBAC, you can create users for your application and assign them specific permissions. These permissions will decide to which limit each user is allowed to access information. The aim of introducing RBAC in user service was to enhance the security of the organization applications and make the job of system administrators easy and efficient. The backend for assigning permissions and decorating user roles is given [here](/src/admin/admin.controller.ts).

### 4. JWT/Basic Authentication Strategies

JSON Web Tokens is an authentication standard that works by assigning and passing around an encrypted token in requests that helps to identify the logged in user, instead of storing the user in a session on the server and creating a cookie. You can view some of these basic stratergies [here](/src/auth/auth-basic.strategy.ts).

### 5. CRUD Operations on a User

As we know, the User service allows us to create a user in the database. But with that, it also allows us to perform various actions on the created user. Lets learn about the importance of other operations in a software application.

CRUD operations may be important in various situations and use cases. 

- Lets say, you want to retrieve the information of a customer who has the highest amount of purchases in a week on an E-commerce website. With user service, the admin can easily retrieve the information of that customer with one click.

- Similarly, the website admin can update the details associated with a user. For example, he can modify the faulty information attached to the user. If needed, the admin can delete the user and all the related information associated with him/her from the organization databases. 

To learn more about operations performed on user, click [here](/src/user/user-db/).

### 6. Login using OTP based Model

Just like how we can use an OTP in user service to reset the forgotten password of a user. We can also use the OTP to log in a user in the organization portal. The OTP based login model is quite different from the standard Username-Password model.

OTP service specifications are given [here](/src/dst/otp/) and the SMS interface and channel details like Gupshup and CDAC are provided in  [this](/src/dst/sms/) codebase.

### 7. Load Balancing  

The APIs are built in a way that mitigates the DevOps task for the application to manage load in case of event-driven, one-off high usage. It scales horizontally to process all the requests.
 

