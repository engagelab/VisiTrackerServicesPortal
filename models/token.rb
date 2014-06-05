require 'mongoid'

class Token
  include Mongoid::Document

  field :expires_on, :type => Bignum
  field :token, :type => String
end