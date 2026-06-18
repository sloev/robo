import socket
import select
import asyncio

class DNSServer:
    def __init__(self, ip="192.168.4.1"):
        self.ip = ip
        try:
            self.ip_bytes = bytes(map(int, ip.split('.')))
        except ValueError:
            self.ip_bytes = b'\xc0\xa8\x04\x01' # Fallback to 192.168.4.1
        self.sock = None
        self.running = False

    async def run(self):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        # Bind to port 53 on all interfaces (0.0.0.0)
        self.sock.bind(('0.0.0.0', 53))
        self.sock.setblocking(False)
        self.running = True
        
        poller = select.poll()
        poller.register(self.sock, select.POLLIN)
        
        print(f"DNS Server started on port 53 (redirecting all DNS queries to {self.ip})")
        
        while self.running:
            try:
                # Non-blocking poll for data (timeout 0 means check and return instantly)
                events = poller.poll(0)
                if events:
                    data, addr = self.sock.recvfrom(512)
                    if len(data) < 12:
                        continue
                    
                    # Transaction ID (first 2 bytes)
                    tid = data[:2]
                    # Flags: 0x8180 (Standard query response, No error)
                    flags = b'\x81\x80'
                    qdcount = b'\x00\x01'
                    ancount = b'\x00\x01'
                    nscount = b'\x00\x00'
                    arcount = b'\x00\x00'
                    
                    # Parse the domain name in the question section
                    ptr = 12
                    while ptr < len(data) and data[ptr] != 0:
                        ptr += data[ptr] + 1
                    
                    # Ensure we have type and class bytes (5 bytes: terminating \x00 + 2B type + 2B class)
                    if ptr + 5 <= len(data):
                        ptr += 5
                        question = data[12:ptr]
                        
                        # Build response packet
                        response = tid + flags + qdcount + ancount + nscount + arcount + question
                        
                        # Add Answer Record:
                        # Compression pointer to name at byte 12 (0xc00c)
                        response += b'\xc0\x0c'
                        # Type A (1), Class IN (1)
                        response += b'\x00\x01\x00\x01'
                        # TTL: 10 seconds (0x0000000a)
                        response += b'\x00\x00\x00\x0a'
                        # Data length: 4 bytes (IPv4)
                        response += b'\x00\x04'
                        # IP Address
                        response += self.ip_bytes
                        
                        self.sock.sendto(response, addr)
                else:
                    # No data, yield CPU to other tasks
                    await asyncio.sleep_ms(20)
            except Exception as e:
                # Silent catch for socket errors (e.g. EWOULDBLOCK) or bad packets
                await asyncio.sleep_ms(50)
                
    def stop(self):
        self.running = False
        if self.sock:
            try:
                self.sock.close()
            except:
                pass
            self.sock = None
        print("DNS Server stopped")
