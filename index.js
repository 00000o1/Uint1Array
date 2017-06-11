"use strict";
{
  const typeNameMatcher = /\[object (\w+)]/;
  const $ = Symbol("[[Uint1ArrayInternal]]");
  const INTERNAL_FORMAT = Uint32Array;

  // Node or browser, either is fine

  // FIXME : remove after testing complete 
  //try { module.exports = Uint1Array; } catch( e ) { Object.assign( self, { Uint1Array } ); }

  // classes 

    class Uint1ArrayPrivates {
      constructor( publics, length ) {
        const wordSize = INTERNAL_FORMAT.BYTES_PER_ELEMENT * 8;
        const wordSizeMask = wordSize - 1;
        const wordSizeShift = msb_index( wordSize );
        const wordCount = ( length + wordSizeMask ) >> wordSizeShift;
        const internal = new INTERNAL_FORMAT( wordCount );
        let changed = true;
        Object.assign( this, {
          changed,
          length,
          wordSize,
          wordSizeMask,
          wordSizeShift,
          internal
        });
      }
      toArray() {
        if ( ! this.changed ) {
          return this.array;
        }
        const array = this.array = new Uint8Array( this.length );
        for( let i = 0; i < this.length; i++ ) {
          array[i] = this.getBit(i);
        }
        this.changed = false;
        return array;
      }
      getBit( i ) {
        if ( i >= this.length ) {
          return;
        }
        const word_number = i >> this.wordSizeShift;
        const word_offset = i & this.wordSizeMask;
        const word = this.internal[word_number];
        const bit = (word >> word_offset)&1;
        return bit;
      }
      setBit( i, bit ) {
        if ( i >= this.length ) {
          return;
        }
        const word_number = i >> this.wordSizeShift;
        const word_offset = i & this.wordSizeMask;
        const word = this.internal[word_number];
        let new_word = word;
        new_word |= ( bit << word_offset ); // make it 1 if 1, no change if 0
        new_word &= ~((~bit&1) << word_offset ); // make it 0 if 0, no change if 1
        if ( word !== new_word ) {
          this.changed = true;
          this.internal[word_number] = new_word;
        }
        return bit;
      }
    }

    class Uint1ArrayPublics {
      // Uint1Array constructor 
      
        constructor( thing ) {
          // find the constructor invocation
          const typeName = resolveTypeName( thing );
          
          // for private internal properties
          const length = thing;
          const privates = new Uint1ArrayPrivates( this, length );
          // testing
          Object.defineProperty( this, 'p', { get: () => privates } );
          Object.defineProperty( this, $, { get: () => privates } );
          console.log("pubs", this, $, privates );
          return this;
        }
      
      // Static property slots on the constructor

        static get BYTES_PER_ELEMENT() {
          return 0.125;
        }
        static get name() {
          return "Uint1Array";
        }
        static get length() {
          return 0;
        }
        static get [Symbol.species]() {
          return this;
        }

      // Static method slots on the constructor 

        static from( iterable ) {
          const temp = [];
          let length = 0;
          for( let item of iterable ) {
            const bit = toBit( item );
            temp.push( bit );
            length++;
          }
          const internal = new Uint8ClampedArray( length );
          internal.set( temp );
          return new this( internal );
        }

        static of( ...items ) {
          return this.from( items );
        }

        // Property slots on the instances

        get buffer() {
          return this[$].buffer;
        }

        get byteLength() {
          return ( this.length + 7 ) >> 3;
        }

        get byteOffset() {
          return 0;
        }

        get length() {
          return this[$].length;
        }

      // Method slots on the instance

        copyWithin( ...args ) {
          this[$].toArray().copyWithin( ...args );
          return this;
        }

        entries() {
          return this[$].toArray().entries();
        }

        every( ...args ) {
          return this[$].toArray().every( ...args );
        }

        fill( ...args ) {
          this[$].toArray().fill( ...args );
          return this;
        }

        filter( ...args ) {
          return new Uint1Array( this[$].toArray().filter( ...args ) );
        }

        find( ...args ) {
          return this[$].toArray().find( ...args );
        }

        findIndex( ...args ) {
          return this[$].toArray().findIndex( ...args );
        }

        forEach( ...args ) {
          this[$].toArray().forEach( ...args );
        }

        includes( ...args ) {
          return this[$].toArray().includes( ...args );
        }

        indexOf( ...args ) {
          return this[$].toArray().indexOf( ...args );
        }

        join( ...args ) {
          return this[$].toArray().join( ...args );
        }

        keys( ...args ) {
          return this[$].toArray().keys( ...args );
        }

        lastIndexOf( ...args ) {
          return this[$].toArray().lastIndexOf( ...args );
        }

        map( ...args ) {
          return new Uint1Array( this[$].toArray().map( ...args ) );
        }

        reduce( ...args ) {
          return this[$].toArray().reduce( ...args );
        }

        reduceRight( ...args ) {
          return this[$].toArray().reduceRight( ...args );
        }

        reverse( ...args ) {
          return new Uint1Array( this[$].toArray().reverse( ...args ) );
        }

        set( ...args ) {
          this[$].toArray().set( ...args );
        }

        slice( ...args ) {
          return new Uint1Array( this[$].toArray().slice( ...args ) );
        }

        sort( ...args ) {
          const sorting = this[$].toArray().sort( ...args );
          this.fill( sorting );
          return this;
        }

        subarray( ...args ) {
          return new Uint1Array( this[$].toArray().subarray( ...args ) );
        }

        values( ...args ) {
          return this[$].toArray().values( ...args );
        }

        toLocaleString( ...args ) {
          return this.toString().toLocaleString();
        }

        toString() {
          return `Uint1Array [ ${ this[$].toArray().join(', ') } ]`;
        }

        [Symbol.iterator]() {
          return this[$].toArray()[Symbol.iterator]();
        }
    }

    class Uint1Array {
      constructor( arg ) {
        const api = new Uint1ArrayPublics( arg );
        const accessorProxy = new AccessorProxy( api );
        this.__proto__ = accessorProxy;
        return this;
      }
    }

  // accessor proxy 

    function AccessorProxy( typed_array_api ) {
      const privates = typed_array_api[$];
      const array_accessor_handler = {
        get( _, slot, surface ) {
          const i = typeof slot == "string" ? parseInt(slot) : slot;
          if ( Number.isInteger( i ) ) {
            return privates.getBit( i );
          } else {
            return Reflect.get( typed_array_api, slot );
          }
        },
        set( _, slot, value, surface ) {
          const i = typeof slot == "string" ? parseInt(slot) : slot;
          if ( Number.isInteger( i ) ) {
            const bit = toBit( value );
            privates.setBit( i, value );
            return true;
          } else {
            return Reflect.set( typed_array_api, slot, value );
          }
        }
      };
      return new Proxy( typed_array_api, array_accessor_handler );
    }

  // helpers
    
    function format( u1 ) {
      let connector = ', ';
      if ( u1.length > 10 ) { 
        connector = ',\n\t';
      }
      return `Uint1Array [ ${ u1[$].toArray().join(connector) } ]`;
    }

    function msb_index( number ) {
      let i = 0;
      while( number >>= 1 ) {
        i++;
      }
      return i;
    }

    function toBit( thing ) {
      return !! thing ? 1 : 0;
    }

    function resolveTypeName( thing ) {
      return typeNameMatcher.exec( Object.prototype.toString.call( thing ) )[1];
    }
  
  (function () {
    const x = new Uint1Array(4);
    console.log("OK", x );
    x[0] = 0;
    x[1] = 1;
    x[2] = 1;
    console.log("x", x );
    console.log( "x1", x[$].getBit(1) );
  }());

  module.exports = Uint1Array;
}
