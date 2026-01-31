# 📌 JJO Serverless Full Stack Application  
### Next.js + AWS Lambda + API Gateway + DynamoDB + Custom Authorizer  

---

## 🚀 Project Overview  

This is a **full-stack serverless web application** built using **Next.js** for the frontend and **AWS Lambda** for the backend.  
All backend APIs are securely exposed using **AWS API Gateway**, and application data is stored in **Amazon DynamoDB**.  

The project includes:  

- ✅ Custom Token-Based Authentication  
- ✅ API Gateway Custom Lambda Authorizer  
- ✅ Admin Login System  
- ✅ Members Management (CRUD)  
- ✅ Email Template Management (CRUD)  
- ✅ Email Sending Feature  

This architecture ensures scalability, security, and minimal infrastructure management.  

---

## 🏗️ Tech Stack  

### Frontend  
- **Next.js (React Framework)**  
- Tailwind CSS  
- Fetch API / Axios  

### Backend  
- **AWS Lambda (Node.js Runtime)**  

### AWS Services  
- **API Gateway** → Secure REST API routing  
- **Custom Lambda Authorizer** → Token validation  
- **DynamoDB** → NoSQL database storage  
- **IAM Roles & Policies** → Secure permissions  
- **CloudWatch Logs** → Monitoring & debugging  

---

## 🌐 System Architecture  

```
User → Next.js Frontend → API Gateway → Custom Authorizer → Lambda → DynamoDB
```

### Request Flow  

1. User logs in through frontend  
2. Backend generates an authentication token  
3. Token is stored in frontend  
4. Token is included in every API request  
5. API Gateway Authorizer validates token  
6. Authorized requests trigger Lambda functions  
7. DynamoDB stores and retrieves data  

---

# 🔐 Authentication & Authorization  

## Admin Login  

| Lambda Function | Purpose |
|----------------|---------|
| `Admin_login_Dev` | Authenticates admin & generates token |

### Login Response Example  

```json
{
  "message": "Login successful",
  "token": "generated-access-token"
}
```

---

## Custom Authorizer  

| Lambda Function | Purpose |
|----------------|---------|
| `authorizer` | Validates token before API access |

API Gateway uses this Lambda Authorizer to protect all private endpoints.  

---

## Token Usage  

All protected API calls require the token in headers:

```http
Authorization: Bearer <token>
```

Example in Next.js:

```js
await fetch("/members", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

---

# 👥 Members Management Module  

Provides full CRUD operations for JJO Members.

## Lambda Functions  

| Function Name | Operation |
|--------------|-----------|
| `Create_JJO_Members_DEV` | Create Member |
| `Fetch_JJO_Members_DEV`  | Fetch Members |
| `Update_JJO_Members_DEV` | Update Member |
| `Delete_JJO_Members_DEV` | Delete Member |

---

## API Endpoints  

| Method | Endpoint | Lambda |
|--------|----------|--------|
| POST   | `/members` | Create_JJO_Members_DEV |
| GET    | `/members` | Fetch_JJO_Members_DEV |
| PUT    | `/members/{id}` | Update_JJO_Members_DEV |
| DELETE | `/members/{id}` | Delete_JJO_Members_DEV |

---

# 📧 Email Template Management  

Manage reusable email templates stored in DynamoDB.

## Lambda Functions  

| Function Name | Operation |
|--------------|-----------|
| `Create_JJO_Email_Template_DEV` | Create Template |
| `Fetch_JJO_Email_Template_DEV`  | Fetch Templates |
| `Update_JJO_Email_Template_DEV` | Update Template |
| `Delete_JJO_Email_Template_DEV` | Delete Template |

---

## API Endpoints  

| Method | Endpoint | Lambda |
|--------|----------|--------|
| POST   | `/email-template` | Create_JJO_Email_Template_DEV |
| GET    | `/email-template` | Fetch_JJO_Email_Template_DEV |
| PUT    | `/email-template/{id}` | Update_JJO_Email_Template_DEV |
| DELETE | `/email-template/{id}` | Delete_JJO_Email_Template_DEV |

---

# ✉️ Email Sending Module  

Send emails to members using templates.

## Lambda Function  

| Function Name | Purpose |
|--------------|---------|
| `Send_email_dev` | Sends email to members |

---

## API Endpoint  

| Method | Endpoint | Lambda |
|--------|----------|--------|
| POST   | `/send-email` | Send_email_dev |

---

# 🗄️ DynamoDB Tables  

## Members Table  

| Attribute | Type | Key |
|----------|------|-----|
| memberId | String | Partition Key |
| name     | String | Attribute |
| email    | String | Attribute |

---

## Email Templates Table  

| Attribute | Type | Key |
|----------|------|-----|
| templateId | String | Partition Key |
| subject    | String | Attribute |
| body       | String | Attribute |

---

# 🎨 Frontend Setup (Next.js)  

## Installation  

```bash
cd frontend
npm install
npm run dev
```

Runs on:

```
http://localhost:3000
```

---

## Environment Variables  

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-id.execute-api.region.amazonaws.com/dev
```

---

# 📊 Monitoring  

- Lambda Logs → CloudWatch  
- API Gateway Logs enabled  
- DynamoDB Metrics monitored via AWS Console  

---

# 🔮 Future Enhancements  

- Refresh token support  
- Role-based access control  
- Email scheduling system  
- CI/CD automation  
- AWS Cognito integration  

---

# 👨‍💻 Author  

Developed by **Shayan Kundu**  
Full Stack Developer | Next.js | AWS Serverless  

---

# ⭐ Conclusion  

This project demonstrates a secure, scalable, serverless architecture using:

✅ Next.js Frontend  
✅ AWS Lambda Backend  
✅ API Gateway + Custom Authorizer  
✅ DynamoDB Database  
✅ Members & Email Management Modules  
