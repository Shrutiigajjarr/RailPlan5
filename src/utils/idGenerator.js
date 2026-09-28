// Utility for generating collision-safe atomic request IDs for Indian Railways maintenance requests

export const generateNextRequestId = (existingRequests = []) => {
  const year = new Date().getFullYear();
  let maxIdNum = 0;
  
  // 1. Check in-memory list
  if (Array.isArray(existingRequests)) {
    existingRequests.forEach(req => {
      if (req.id && req.id.startsWith(`REQ-${year}-`)) {
        const numPart = parseInt(req.id.split('-')[2], 10);
        if (!isNaN(numPart) && numPart > maxIdNum) {
          maxIdNum = numPart;
        }
      }
    });
  }

  // 2. Check canonical localStorage to avoid duplicate IDs across tabs
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('railplan_requests_v3');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach(req => {
            if (req.id && req.id.startsWith(`REQ-${year}-`)) {
              const numPart = parseInt(req.id.split('-')[2], 10);
              if (!isNaN(numPart) && numPart > maxIdNum) {
                maxIdNum = numPart;
              }
            }
          });
        }
      }

      // Check persistent sequence counter if any
      const seqStr = localStorage.getItem('railplan_request_seq_v3');
      if (seqStr) {
        const seqVal = parseInt(seqStr, 10);
        if (!isNaN(seqVal) && seqVal > maxIdNum) {
          maxIdNum = seqVal;
        }
      }
    } catch (e) {}
  }

  const nextNum = maxIdNum + 1;
  
  // Persist updated sequence number
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('railplan_request_seq_v3', String(nextNum));
    } catch (e) {}
  }

  const paddedNum = String(nextNum).padStart(4, '0');
  return `REQ-${year}-${paddedNum}`;
};

export default generateNextRequestId;
