#!/usr/bin/env node
import crypto from 'crypto';

// Generate a random secret key
const secretKey = crypto.randomBytes(32).toString('hex');

// Print the secret key
console.log(secretKey);
