# # --- Base image
# FROM node:20-alpine

# # --- App directory
# WORKDIR /app

# # --- Install deps
# COPY package*.json ./
# RUN npm ci

# # --- Copy rest of the files
# COPY . .

# # --- Build the Next.js app
# RUN npm run build

# # --- Expose port
# EXPOSE 3000

# # --- Start command
# CMD ["npm", "run", "start"]
