require 'mongoid'

class Visitor
  include Mongoid::Document

  belongs_to :visitorgroup
  has_and_belongs_to_many :interactions

  field :created_on, :type => Bignum
  field :age, :type => String
  field :sex, :type => String
  field :nationality, :type => String
  field :comment, :type => String
  field :color, :type => String
  field :isGroupVisitor, :type => Boolean, :default => false

  has_and_belongs_to_many :artefacts, class_name: "Artefact"
end
