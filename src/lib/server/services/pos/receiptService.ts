import type { Transaction } from '$lib/types/pos';

/**
 * Service for handling receipt printing in the POS system
 */
export class ReceiptService {
  /**
   * Generate receipt content for a transaction
   */
  generateReceiptContent(transaction: Transaction, businessInfo: BusinessInfo): string {
    // 58mm receipt printer typically supports 32 characters per line
    const LINE_WIDTH = 32;
    const receiptLines: string[] = [];
    
    // Business header
    receiptLines.push(this.centerText(businessInfo.name, LINE_WIDTH));
    receiptLines.push(this.centerText(businessInfo.address, LINE_WIDTH));
    receiptLines.push(this.centerText(businessInfo.phone, LINE_WIDTH));
    receiptLines.push(this.centerText(businessInfo.email, LINE_WIDTH));
    receiptLines.push(this.repeatChar('-', LINE_WIDTH));
    
    // Transaction info
    receiptLines.push(`Receipt: ${transaction.id}`);
    receiptLines.push(`Date: ${this.formatDate(transaction.date)}`);
    receiptLines.push(`Time: ${this.formatTime(transaction.date)}`);
    receiptLines.push(this.repeatChar('-', LINE_WIDTH));
    
    // Items
    receiptLines.push('ITEM                  QTY   PRICE');
    receiptLines.push(this.repeatChar('-', LINE_WIDTH));
    
    for (const item of transaction.items) {
      const itemName = this.truncateText(item.name, 20);
      const quantity = item.quantity.toString().padStart(3, ' ');
      const price = `AED ${this.formatPrice(item.price * item.quantity)}`.padStart(9, ' ');
      
      receiptLines.push(`${itemName} ${quantity} ${price}`);
    }
    
    receiptLines.push(this.repeatChar('-', LINE_WIDTH));
    
    // Totals
    receiptLines.push(`SUBTOTAL:                  AED ${this.formatPrice(transaction.total)}`);
    receiptLines.push(`TAX (0%):                  AED 0.00`);
    receiptLines.push(`TOTAL:                     AED ${this.formatPrice(transaction.total)}`);
    receiptLines.push(`PAYMENT: ${transaction.paymentMethod.padEnd(15, ' ')} AED ${this.formatPrice(transaction.total)}`);
    
    // Footer
    receiptLines.push(this.repeatChar('-', LINE_WIDTH));
    receiptLines.push(this.centerText('Thank you for your purchase!', LINE_WIDTH));
    receiptLines.push(this.centerText('Please come again', LINE_WIDTH));
    
    return receiptLines.join('\n');
  }
  
  /**
   * Print receipt to a connected printer
   * This is a simulated implementation
   */
  async printReceipt(transaction: Transaction, businessInfo: BusinessInfo, printerName?: string): Promise<boolean> {
    try {
      // Generate receipt content
      const receiptContent = this.generateReceiptContent(transaction, businessInfo);
      
      // In a real implementation, this would send the receipt to a physical printer
      // For now, we'll simulate success with a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Printing receipt for transaction:', transaction.id);
      console.log('Receipt content:');
      console.log(receiptContent);
      
      return true;
    } catch (error) {
      console.error('Error printing receipt:', error);
      return false;
    }
  }
  
  /**
   * Get available printers
   * This is a simulated implementation
   */
  async getAvailablePrinters(): Promise<string[]> {
    // In a real implementation, this would detect connected printers
    // For now, we'll return mock data with 58mm printers
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      'POS Printer (58mm)',
      'Thermal Receipt Printer (58mm)',
      'Cashier Printer (58mm)',
      'Office Printer'
    ];
  }
  
  // Helper methods
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
  
  private formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
  
  private formatPrice(price: number): string {
    return price.toFixed(2);
  }
  
  private centerText(text: string, width: number): string {
    if (text.length >= width) {
      return text.substring(0, width);
    }
    
    const padding = Math.floor((width - text.length) / 2);
    return ' '.repeat(padding) + text;
  }
  
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text.padEnd(maxLength, ' ');
    }
    
    return text.substring(0, maxLength - 3) + '...';
  }
  
  private repeatChar(char: string, count: number): string {
    return char.repeat(count);
  }
}

export interface BusinessInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export const receiptService = new ReceiptService();
